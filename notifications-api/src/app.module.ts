import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmOptions } from './configs/typeorm.config';
import { EntitiesModule } from 'notification/entities';
import { UtilsModule } from 'notification/utils';
import { SecurityModule } from 'notification/security';
import { TasksModule } from './tasks/tasks.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FirebaseAuthGuard } from './auth/guards/firebase-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { GroupsController } from './groups/groups.controller';
import { GroupsService } from './groups/groups.service';
import { GroupsModule } from './groups/groups.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(TypeOrmOptions),
    EntitiesModule,
    UtilsModule,
    SecurityModule,
    TasksModule,
    AuthModule,
    UsersModule,
    EventEmitterModule.forRoot(),//Este es el módulo de eventos
    GroupsModule, NotificationsModule, 
  ],
  controllers: [AppController, GroupsController],
  providers: [AppService, { provide: APP_GUARD, useClass: FirebaseAuthGuard }, GroupsService],
})
export class AppModule {}
