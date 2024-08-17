import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { EntitiesModule } from 'notification/entities';

@Module({
  imports: [EntitiesModule],
  controllers: [NotificationsController],
  providers: [NotificationsService]
})
export class NotificationsModule {}
