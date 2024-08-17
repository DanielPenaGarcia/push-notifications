import { Module } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { UtilsModule } from 'notification/utils';
import { EntitiesModule } from 'notification/entities';
import { CreateTaskGroupListener } from './listeners/create-task-group.listener';
import { CreateGroupListener } from './listeners/create-group.listener';
import { JoinToGroupListener } from './listeners/join-to-group.listener';
import { GroupLeaveListener } from './listeners/group-leave.listener';

@Module({
    imports: [EntitiesModule, UtilsModule],
    controllers: [GroupsController],
    providers: [GroupsService, CreateTaskGroupListener, CreateGroupListener, JoinToGroupListener, GroupLeaveListener],
})
export class GroupsModule {}
