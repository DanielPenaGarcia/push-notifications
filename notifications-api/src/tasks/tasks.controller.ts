import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDTO } from './input-dto/create-task.dto';
import { Task } from 'notification/entities/classes/task.entity';
import { FindAllTasksQuery } from './decorators/find-all-tasks.decorator';
import { FindAllTasksQueryDTO } from './input-dto/find-all-tasks.query';
import { Request } from 'express';
import { User } from 'notification/entities/classes/user.entity';
import { BypassAuth } from 'notification/security/utils/bypass.auth';
import { ToggleTaskStatus } from './input-dto/toggle-task-status.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  async createTask(
    @Req() req: Request,
    @Body() body: CreateTaskDTO,
  ): Promise<Task> {
    const user = req.user as User;
    return await this.tasksService.createTask(body, user);
  }

  @Get()
  async findAllTasks(
    @FindAllTasksQuery() query: FindAllTasksQueryDTO,
    @Req() req: Request,
  ): Promise<Task[]> {
    const userId = (req.user as User).id;
    return await this.tasksService.findAllTasksByUserId(query, userId);
  }

  @Delete(':taskId')
  async deleteTask(@Req() req: Request, @Param('taskId') taskId: string) {
    const userId = (req.user as User).id;
    return await this.tasksService.deleteTask(taskId, userId);
  }

  @Patch(':taskId/toggle-status')
  async toggleTaskStatus(
    @Req() req: Request,
    @Body() body: ToggleTaskStatus,
    @Param('taskId') taskId: string,
  ) {
    const userId = (req.user as User).id;
    return await this.tasksService.toggleTaskStatus(
      taskId,
      userId,
      body.status,
    );
  }
}
