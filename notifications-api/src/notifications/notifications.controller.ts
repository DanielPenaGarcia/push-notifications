import { Body, Controller, Delete, Get, Param, Post, Req } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Request } from 'express';
import { SaveNotificationDTO } from './input-dto/save-notification.dto';
import { User } from 'notification/entities/classes/user.entity';
import { Notification } from 'notification/entities/classes/notification.entity';
import { FindAllNotificationsQuery } from './decorators/find-all-notifications.decorator';
import { RemoveNotificationDTO } from './input-dto/remove-notification.dto';
import { FindAllNotificationsQueryDTO } from './input-dto/find-all-notifications.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  async saveNotification(
    @Req() req: Request,
    @Body() body: SaveNotificationDTO,
  ): Promise<Notification> {
    const userId = (req.user as User).id;
    return this.notificationsService.saveNotification(userId, body);
  }

  @Get()
  async findAllNotifications(@Req() req: Request, @FindAllNotificationsQuery() query: FindAllNotificationsQueryDTO): Promise<Notification[]> {
    const userId = (req.user as User).id;
    return this.notificationsService.findAllNotifications(userId, query);
  }

  @Delete(':id')
  async removeNotification(@Req() req: Request, @Param('id') notificationId: string): Promise<Notification> {
    const userId = (req.user as User).id;
    return this.notificationsService.removeNotification(userId, notificationId);
  }
}
