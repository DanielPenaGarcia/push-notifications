import { Module } from '@nestjs/common';
import { EntitiesModule } from 'notification/entities';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { UtilsModule } from 'notification/utils';
import { CompleteGroupTaskListener } from './listeners/complete-group-task.listener';

@Module({
    imports: [EntitiesModule, UtilsModule],
    controllers: [TasksController],
    providers: [TasksService, CompleteGroupTaskListener],
})
export class TasksModule {}
