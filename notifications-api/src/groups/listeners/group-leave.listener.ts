import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import * as firebase from 'firebase-admin';
import { FIREBASE_APP } from 'notification/utils/providers/firebase-admin.provider';
import {
  GROUP_LEAVE_EVENT,
  GroupLeaveEvent,
} from '../events/group-leave.event';
import { InjectRepository } from '@nestjs/typeorm';
import { UserGroup } from 'notification/entities/classes/user-groups.entity';
import { Repository } from 'typeorm';
import { User } from 'notification/entities/classes/user.entity';
import { Group } from 'notification/entities/classes/group.entity';

@Injectable()
export class GroupLeaveListener {
  constructor(
    @Inject(FIREBASE_APP) private readonly firebaseService: firebase.app.App,
    @InjectRepository(UserGroup) private readonly userGroupRepository: Repository<UserGroup>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Group) private readonly groupRepository: Repository<Group>,

  ) {}

  @OnEvent(GROUP_LEAVE_EVENT, { async: true })
  async handleOrderCreatedEvent(event: GroupLeaveEvent) {
    try {
      const userGroup: UserGroup = await this.getUserGroup(event.userId, event.groupId);
      if(userGroup) {
        await this.subscribeToTopic(userGroup.user.tokenDevice, userGroup.group.code);
        return;
      }
      const user: User = await this.getUserById(event.userId);
      const group: Group = await this.getGroupById(event.groupId);
      await this.unsubscribeFromGroup(user.tokenDevice, group.code);
      await this.sendNotificationToGroup(user, group);
    } catch (error) {
        console.error('Error handling order created event', error);
    }
  }

  private async getUserGroup(userId: string, groupId: string) {
    return await this.userGroupRepository.findOne({
      where: {
        group: { id: groupId },
        user: { id: userId },
      },
      relations: { user: true, group: true },
      select: {
        id: true,
        user: { id: true, tokenDevice: true, email: true },
        group: { id: true, code: true, name: true },
      }
    });
  }

  private async getUserById(userId: string){
    return await this.userRepository.findOne({
      where: { id: userId },
      select: { id: true, tokenDevice: true, email: true },
    });
  }

  private async getGroupById(groupId: string){
    return await this.groupRepository.findOne({
      where: { id: groupId },
      select: { id: true, code: true, name: true },
    });
  }

  private async subscribeToTopic(token: string, topic: string) {
    try {
      if(token){
        await this.firebaseService.messaging().subscribeToTopic(token, topic);
      }
    } catch (error) {
      throw new Error(`Error subscribing to topic: ${error}`);
    }
  }

  private async unsubscribeFromGroup(token: string, topic: string) {
    try {
      if(token){
        await this.firebaseService.messaging().unsubscribeFromTopic(token, topic);
      }
    } catch (error) {
      throw new Error(`Error unsubscribing from topic: ${error}`);
    }
  }

  private async sendNotificationToGroup(user: User, group: Group) {
    try {
      const message = this.createMessageByUserGroup(user, group);
      await this.firebaseService.messaging().sendEach([message]);
    } catch (error) {
      throw new Error(`Error sending notification to group: ${error}`);
    }
  }

  private createMessageByUserGroup(user:User, group: Group) {
    return {
      topic: group.code,
      notification: {
        title: 'User left group',
        body: `${user.email} has left the group ${group.name}`,
      },
      data: {
        groupId: group.id,
        groupName: group.name,
        userTokenDevice: user.tokenDevice || '',
      },
      android: {
        notification: {
          channelId: 'group'
        }
      }
    };
  }

}
