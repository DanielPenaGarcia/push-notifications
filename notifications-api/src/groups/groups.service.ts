import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Group } from 'notification/entities/classes/group.entity';
import { UserGroup } from 'notification/entities/classes/user-groups.entity';
import { User } from 'notification/entities/classes/user.entity';
import { Repository } from 'typeorm';
import { CreateGroupDTO } from './input-dto/create-group.dto';
import { FindAllGroupsQueryDTO } from './input-dto/find-all-groups.dto';
import { FindAllTasksByGroupQueryDTO } from './input-dto/find-all-task-by-group-id.dto';
import { Task } from 'notification/entities/classes/task.entity';
import { CreateTaskForGroupDTO } from './input-dto/create-task-for-group';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  JOIN_TO_GROUP_EVENT,
  JoinToGroupEvent,
} from './events/join-to-group.event';
import {
  CREATE_TASK_GROUP_EVENT,
  CreateTaskGroupEvent,
} from './events/create-task-group.event';
import {
  CREATE_GROUP_EVENT,
  CreateGroupEvent,
} from './events/create-group.event';
import { group } from 'console';
import { GROUP_LEAVE_EVENT, GroupLeaveEvent } from './events/group-leave.event';
import { Notification } from 'notification/entities/classes/notification.entity';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(UserGroup)
    private readonly userGroupRepository: Repository<UserGroup>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(Task) private readonly taskRepository: Repository<Task>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createGroup(
    createGroupDTO: CreateGroupDTO,
    userId: string,
  ): Promise<Group> {
    const groupExist: Group = await this.groupRepository.findOneBy({
      code: createGroupDTO.code,
    });
    if (groupExist) {
      throw new HttpException(
        `Group with code ${createGroupDTO.code} already exist`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const user: User = await this.userRepository.findOneBy({ id: userId });
    const newGroup: Group = this.groupRepository.create({
      code: createGroupDTO.code,
      name: createGroupDTO.name,
    });
    const groupSaved: Group = await this.groupRepository.save(newGroup);
    const userGroup: UserGroup = new UserGroup();
    userGroup.user = user;
    userGroup.group = groupSaved;
    await this.userGroupRepository.save(userGroup);
    const createGroupEvent: CreateGroupEvent = {
      userId: userId,
      groupId: groupSaved.id,
    };
    this.eventEmitter.emit(CREATE_GROUP_EVENT, createGroupEvent);
    return groupSaved;
  }

  async getGroupsByUserId(
    userId: string,
    query: FindAllGroupsQueryDTO,
  ): Promise<Group[]> {
    const groups: Group[] = await this.groupRepository.find({
      where: {
        userGroups: { user: { id: userId } },
      },
      relations: { userGroups: true },
      order: query.sort,
      skip: query.skip,
      take: query.limit,
    });
    return groups;
  }

  async addUserToGroup(userId: string, groupCode: string): Promise<Group> {
    const user: User = await this.userRepository.findOneBy({ id: userId });
    const group: Group = await this.groupRepository.findOneBy({
      code: groupCode,
    });
    if (!group) {
      throw new HttpException(
        `Group with code ${groupCode} does not exist`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const userGroup: UserGroup = await this.userGroupRepository.findOne({
      where: { user: { id: userId }, group: { id: group.id } },
    });
    if (userGroup) {
      throw new HttpException(
        `User is already in group with code ${groupCode}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const newUserGroup: UserGroup = this.userGroupRepository.create({
      user: user,
      group: group,
    });
    await this.userGroupRepository.save(newUserGroup);
    const joinToGroupEvent: JoinToGroupEvent = {
      userId: userId,
      groupId: group.id,
    };
    this.eventEmitter.emit(JOIN_TO_GROUP_EVENT, joinToGroupEvent);
    return group;
  }

  async leaveGroup(userId: string, groupId: string): Promise<Group> {
    const group = await this.groupRepository.findOneBy({ id: groupId });
    if (!group) {
      throw new HttpException(
        `Group with id ${groupId} does not exist`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new HttpException(
        `User with id ${userId} does not exist`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const userGroup = await this.userGroupRepository.findOne({
      where: { user: { id: userId }, group: { id: groupId } },
      relations: { group: true, user: true },
    });

    if (!userGroup) {
      throw new HttpException(
        `User is not in group with id ${groupId}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.userGroupRepository.remove(userGroup);
    await this.notificationRepository.delete({
      group: { id: groupId },
      user: { id: userId },
    });
    const groupCount = await this.userGroupRepository.count({
      where: { group: { id: groupId } },
    });
    if (groupCount === 0) {
      await this.taskRepository.delete({ group: { id: groupId } });
      await this.groupRepository.delete({ id: groupId });
    }
    if(groupCount > 0) {
      const groupLeaveEvent: GroupLeaveEvent = {
        userId: userId,
        groupId: groupId,
      };
      this.eventEmitter.emit(GROUP_LEAVE_EVENT, groupLeaveEvent);
    }
    return group;
  }

  async findTasksByGroupId(
    groupId: string,
    userId: string,
    params: FindAllTasksByGroupQueryDTO,
  ): Promise<Task[]> {
    const userGroup: UserGroup = await this.userGroupRepository.findOne({
      where: { user: { id: userId }, group: { id: groupId } },
    });
    if (!userGroup) {
      throw new HttpException(
        `User is not in group with id ${groupId}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const tasks: Task[] = await this.taskRepository.find({
      where: {
        group: { id: groupId },
      },
      relations: ['group'],
      order: params.sort,
      skip: params.skip,
      take: params.limit,
    });
    return tasks;
  }

  async createTaskForGroup(
    task: CreateTaskForGroupDTO,
    userId: string,
    groupId: string,
  ): Promise<Task> {
    const user: User = await this.userRepository.findOneBy({ id: userId });
    const group: Group = await this.groupRepository.findOneBy({ id: groupId });
    const userGroup: UserGroup = await this.userGroupRepository.findOne({
      where: { user: { id: user.id }, group: { id: group.id } },
    });

    if (!userGroup) {
      throw new HttpException(
        `User is not in group with id ${groupId}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const newTask: Task = new Task(task.title, task.description, user);
    newTask.group = group;
    const taskSaved: Task = await this.taskRepository.save(newTask);
    const createTaskGroupEvent: CreateTaskGroupEvent = {
      userId: userId,
      groupId: groupId,
      taskTitle: task.title,
    };
    this.eventEmitter.emit(CREATE_TASK_GROUP_EVENT, createTaskGroupEvent);
    return taskSaved;
  }
}
