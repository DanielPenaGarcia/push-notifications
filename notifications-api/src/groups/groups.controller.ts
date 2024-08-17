import { Body, Controller, Delete, Get, Param, Post, Req } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDTO } from './input-dto/create-group.dto';
import { Request } from 'express';
import { User } from 'notification/entities/classes/user.entity';
import { FindAllGroupsQuery } from './decorators/find-all-groups.decorator';
import { FindAllGroupsQueryDTO } from './input-dto/find-all-groups.dto';
import { Group } from 'notification/entities/classes/group.entity';
import { AddUserToGroupDTO } from './input-dto/add-user-to-group';
import { FindAllTasksByGroupQuery } from './decorators/find-all-task-by-group-id.decorator';
import { FindAllTasksQueryDTO } from 'src/tasks/input-dto/find-all-tasks.query';
import { GroupId as GroupIdDTO } from './input-dto/group-id.dto';
import { CreateTaskForGroupDTO } from './input-dto/create-task-for-group';
import { Task } from 'notification/entities/classes/task.entity';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  async createGroup(
    @Req() req: Request,
    @Body() body: CreateGroupDTO,
  ): Promise<any> {
    const userId = (req.user as User).id;
    return await this.groupsService.createGroup(body, userId);
  }

  @Get()
  async getGroups(@Req() req: Request, @FindAllGroupsQuery() query: FindAllGroupsQueryDTO): Promise<Group[]> {
    const userId = (req.user as User).id;
    return await this.groupsService.getGroupsByUserId(userId, query);
  }

  @Delete(':groupId')
  async leaveGroup(@Req() req: Request, @Param() params: GroupIdDTO): Promise<any> {
    const userId = (req.user as User).id;
    return await this.groupsService.leaveGroup(userId, params.groupId);
  }

  @Post('add-group')
  async addUserToGroup(@Req() req: Request, @Body() body: AddUserToGroupDTO): Promise<Group> {
    const userId = (req.user as User).id;
    return await this.groupsService.addUserToGroup(userId, body.groupCode);
  }

  @Post(':groupId/tasks')
  async createTaskForGroup(@Req() req: Request, @Body() body: CreateTaskForGroupDTO, @Param() params: GroupIdDTO): Promise<Task> {
    const userId = (req.user as User).id;
    return await this.groupsService.createTaskForGroup(body, userId, params.groupId);
  }

  @Get(':groupId/tasks')
  async getTasksByGroupId(@Req() req: Request, @FindAllTasksByGroupQuery() query: FindAllTasksQueryDTO, @Param() params: GroupIdDTO): Promise<any> {
    const userId = (req.user as User).id;
    return await this.groupsService.findTasksByGroupId(params.groupId, userId, query);
  }
}
