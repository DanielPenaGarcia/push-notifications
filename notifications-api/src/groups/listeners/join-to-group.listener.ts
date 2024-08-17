import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import * as firebase from 'firebase-admin';
import {
  JOIN_TO_GROUP_EVENT,
  JoinToGroupEvent,
} from '../events/join-to-group.event';
import { FIREBASE_APP } from 'notification/utils/providers/firebase-admin.provider';
import { InjectRepository } from '@nestjs/typeorm';
import { UserGroup } from 'notification/entities/classes/user-groups.entity';
import { Repository } from 'typeorm';
import { User } from 'notification/entities/classes/user.entity';
import { Group } from 'notification/entities/classes/group.entity';

@Injectable()
export class JoinToGroupListener {
  constructor(
    @Inject(FIREBASE_APP) private readonly firebaseService: firebase.app.App,
    @InjectRepository(UserGroup)
    private readonly userGroupRepository: Repository<UserGroup>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
  ) {}

  @OnEvent(JOIN_TO_GROUP_EVENT, { async: true })
  async handleOrderCreatedEvent(event: JoinToGroupEvent) {
    try {
      const userGroup: UserGroup = await this.getUserGroup(
        event.userId,
        event.groupId,
      );
      if (!userGroup) {
        const user: User = await this.getUserById(event.userId);
        const group: Group = await this.getGroupById(event.groupId);
        await this.unsubscribeFromGroup(user.tokenDevice, group.code);
        return;
      }
      await this.sendNotificationToGroup(userGroup);
      await this.subscribeToTopic(userGroup.user.tokenDevice, userGroup.group.code);
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
      },
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

  private async sendNotificationToGroup(userGroup: UserGroup) {
    try {
      const message = this.createMessageByUserGroup(userGroup);
      await this.firebaseService.messaging().sendEach([message]);
    } catch (error) {
      throw new Error(`Error sending notification to group: ${error}`);
    }
  }

  private createMessageByUserGroup(userGroup: UserGroup) {
    return {
      notification: {
        title: `Group ${userGroup.group.name}`,
        body: `${userGroup.user.email} has joined to group ${userGroup.group.name}`,
      },
      data: {
        groupId: userGroup.group.id,
        groupName: userGroup.group.name,
        userTokenDevice: userGroup.user.tokenDevice || '',
      },
      topic: userGroup.group.code,
      android: {
        notification: {
          channelId: 'gruop',
        },
      },
    };
  }

  private async getUserById(userId: string) {
    return await this.userRepository.findOne({
      where: { id: userId },
      select: { id: true, tokenDevice: true },
    });
  }

  private async getGroupById(groupId: string) {
    return await this.groupRepository.findOne({
      where: { id: groupId },
      select: { id: true, code: true },
    });
  }
}
