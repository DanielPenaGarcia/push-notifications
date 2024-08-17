import { Module } from '@nestjs/common';
import { EntitiesService } from './entities.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './classes/user.entity';
import { Task } from './classes/task.entity';
import { Group } from './classes/group.entity';
import { UserGroup } from './classes/user-groups.entity';
import { Notification } from './classes/notification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    User,
    Task,
    Group,
    UserGroup,
    Notification,
  ])],
  providers: [EntitiesService],
  exports: [EntitiesService, TypeOrmModule],
})
export class EntitiesModule {}
