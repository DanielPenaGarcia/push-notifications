import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from 'notification/entities/classes/notification.entity';
import { Repository } from 'typeorm';
import { SaveNotificationDTO } from './input-dto/save-notification.dto';
import { User } from 'notification/entities/classes/user.entity';
import { Group } from 'notification/entities/classes/group.entity';
import { FindAllNotificationsQueryDTO } from './input-dto/find-all-notifications.dto';
import { RemoveNotificationDTO } from './input-dto/remove-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
  ) {}

  async saveNotification(
    userId: string,
    notificationDTO: SaveNotificationDTO,
  ): Promise<Notification> {
    const user: User = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const group: Group = await this.groupRepository.findOneBy({
      id: notificationDTO.groupId,
      userGroups: { user: { id: userId } },
    });
    if (!group) {
      throw new HttpException(
        `User ${user.email} is not a member of group`,
        HttpStatus.NOT_FOUND,
      );
    }
    const notification = this.notificationRepository.create({
      title: notificationDTO.title,
      description: notificationDTO.description,
      user,
      group,
    });
    return this.notificationRepository.save(notification);
  }

  async findAllNotifications(
    userId: string,
    query: FindAllNotificationsQueryDTO,
  ): Promise<Notification[]> {
    const user: User = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return this.notificationRepository.find({
      where: { user: { id: userId } },
      relations: { group: true },
      select: { group: { id: true, name: true } },
      order: { createdAt: 'DESC' },
      skip: query.skip,
      take: query.limit,
    });
  }

  async removeNotification(userId: string, notificationId: string): Promise<Notification> {
    const notificationToRemove: Notification = await this.notificationRepository.findOneBy({
        id: notificationId,
        user: { id: userId },
    });
    if (!notificationToRemove) {
      throw new HttpException('Notification not found', HttpStatus.NOT_FOUND);
    }
    await this.notificationRepository.remove(notificationToRemove);
    notificationToRemove.id = notificationId;
    return notificationToRemove;
  }
}
