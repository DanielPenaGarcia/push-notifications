import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import * as firebase from 'firebase-admin';
import { FIREBASE_APP } from 'notification/utils/providers/firebase-admin.provider';
import {
  DEVICE_TOKEN_CHANGED_EVENT,
  DeviceTokenChangedEvent,
} from '../events/device-token-changed.event';
import { InjectRepository } from '@nestjs/typeorm';
import { Group } from 'notification/entities/classes/group.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DeviceTokenChangedListener {
  constructor(
    @Inject(FIREBASE_APP) private readonly firebaseService: firebase.app.App,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
  ) {}

  @OnEvent(DEVICE_TOKEN_CHANGED_EVENT)
  async handleOrderCreatedEvent(event: DeviceTokenChangedEvent) {
    try {
      const groups: Group[] = await this.getGroups(event.userId);
      await this.unsubscribeFromTopicGroups(event.oldToken, groups);
      await this.subscribeToTopicGroups(event.newToken, groups);
    } catch (error) {
      console.error(`Error handling device token changed event: ${error.message}`, error);
    }
  }

  private async getGroups(userId: string): Promise<Group[]> {
    return await this.groupRepository.find({
      where: {
        userGroups: { user: { id: userId } },
      },
      relations: { userGroups: { user: true } },
      select: { code: true },
    });
  }

  private async subscribeToTopicGroups(token: string, groups: Group[]) {
    try {
      if(!token){
        return;
      }
      for (const group of groups) {
        await this.firebaseService.messaging().subscribeToTopic(token, group.code);
      }
    } catch (error) {
      console.error(`Error subscribing to topic: ${error.message}`, error);
    }
  }

  private async unsubscribeFromTopicGroups(token: string, groups: Group[]) {
    try {
      if(!token){
        return;
      }
      for (const group of groups) {
        await this.firebaseService.messaging().unsubscribeFromTopic(token, group.code);
      }
    } catch (error) {
      console.error(`Error unsubscribing from topic: ${error.message}`, error);
    }
  }
}
