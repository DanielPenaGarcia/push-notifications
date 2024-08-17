import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Task } from 'notification/entities/classes/task.entity';
import { IsNull, Not, Repository } from 'typeorm';
import { CreateTaskDTO } from './input-dto/create-task.dto';
import { FindAllTasksQueryDTO } from './input-dto/find-all-tasks.query';
import { User } from 'notification/entities/classes/user.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Group } from 'notification/entities/classes/group.entity';
import {
  COMPLETE_GROUP_TASK_EVENT,
  CompleteGroupTaskEvent,
} from './events/complete-group-task.event';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private readonly taskRepository: Repository<Task>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createTask(task: CreateTaskDTO, user: User): Promise<Task> {
    const newTask: Task = new Task(task.title, task.description, user);
    return await this.taskRepository.save(newTask);
  }

  async findAllTasksByUserId(
    query: FindAllTasksQueryDTO,
    userId: string,
  ): Promise<Task[]> {
    return await this.taskRepository.find({
      where: {
        user: {
          id: userId,
        },
        group: IsNull(),
      },
      relations: { group: true },
      skip: query.skip,
      take: query.limit,
      order: query.sort,
    });
  }

  async deleteTask(taskId: string, userId: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
      relations: { group: true, user: true },
      select: {
        user: { id: true },
        group: { id: true },
        id: true,
        title: true,
        description: true,
        completed: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!task) {
      throw new Error(`Task with id ${taskId} not found`);
    }
    if (task.group) {
      return await this.deleteTaskInGroup(taskId, userId);
    }
    if (task.user.id !== userId) {
      throw new Error(
        `Task with id ${taskId} is not owned by user with id ${userId}`,
      );
    }
    const taskIdDeleted = task.id;
    const taskDeleted = await this.taskRepository.remove(task);
    taskDeleted.id = taskIdDeleted;
    return taskDeleted;
  }

  async toggleTaskStatus(
    taskId: string,
    userId: string,
    status: boolean,
  ): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: {
        id: taskId,
      },
      relations: { group: true, user: true },
      select: {
        user: { id: true },
        group: { id: true },
        id: true,
        title: true,
        description: true,
        completed: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!task) {
      throw new Error(`Task with id ${taskId} not found`);
    }
    if (task.group) {
      return await this.toggleTaskStatusInGroup(taskId, userId, status);
    }
    if (task.user.id !== userId) {
      throw new Error(
        `Task with id ${taskId} is not owned by user with id ${userId}`,
      );
    }
    task.completed = status;
    return await this.taskRepository.save(task);
  }

  async toggleTaskStatusInGroup(
    taskId: string,
    userId: string,
    status: boolean,
  ): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: {
        id: taskId,
      },
      relations: { group: true },
      select: { group: { id: true } },
    });
    if (!task) {
      throw new Error(`Task with id ${taskId} not found`);
    }
    if (!task.group) {
      throw new Error(`Task with id ${taskId} is not a group task`);
    }
    const group = await this.groupRepository.findOne({
      where: {
        id: task.group.id,
        userGroups: { user: { id: userId } },
      },
      relations: { userGroups: true },
    });
    if (!group) {
      throw new Error(`User with id ${userId} is not in the group`);
    }
    const user: User = await this.userRepository.findOne({
      where: { id: userId },
    });
    task.completed = status;
    const taskUpdated: Task = await this.taskRepository.save(task);
    if (status) {
      const event: CompleteGroupTaskEvent = {
        groupCode: group.code,
        groupName: group.name,
        groupId: group.id,
        userName: user.email,
        userTokenDevice: user.tokenDevice,
        taskTitle: task.title,
      };
      this.eventEmitter.emit(COMPLETE_GROUP_TASK_EVENT, event);
    }
    return taskUpdated;
  }

  async deleteTaskInGroup(taskId: string, userId: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: {
        id: taskId,
      },
      relations: { group: true, user: true },
      select: {
        user: { id: true },
        group: { id: true },
        id: true,
        title: true,
        description: true,
        completed: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!task) {
      throw new Error(`Task with id ${taskId} not found`);
    }
    if (!task.group) {
      throw new Error(`Task with id ${taskId} is not a group task`);
    }
    const group = await this.groupRepository.findOne({
      where: {
        id: task.group.id,
        userGroups: {
          user: { id: userId },
        },
      },
    });
    if (!group) {
      throw new Error(`User with id ${userId} is not in the group`);
    }
    const taskIdDeleted = task.id;
    const taskDeleted = await this.taskRepository.remove(task);
    taskDeleted.id = taskIdDeleted;
    return taskDeleted;
  }
}
