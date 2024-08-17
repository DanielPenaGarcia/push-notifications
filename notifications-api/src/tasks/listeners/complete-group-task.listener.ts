import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import * as firebase from 'firebase-admin';
import { FIREBASE_APP } from 'notification/utils/providers/firebase-admin.provider';
import {
  COMPLETE_GROUP_TASK_EVENT,
  CompleteGroupTaskEvent,
} from '../events/complete-group-task.event';

@Injectable()
export class CompleteGroupTaskListener {
  constructor(
    @Inject(FIREBASE_APP) private readonly firebaseService: firebase.app.App,
  ) {}

  @OnEvent(COMPLETE_GROUP_TASK_EVENT, { async: true })
  async handleOrderCreatedEvent(event: CompleteGroupTaskEvent) {
    try {
      await this.unsubscribeFromGroup(event.userTokenDevice, event.groupCode);
      await this.sendTaskCompletedNotification(event);
      await this.subscribeToTopic(event.userTokenDevice, event.groupCode);
    } catch (error) {
      console.error('Error handling order created event', error);
    }
  }

  private async sendTaskCompletedNotification(event: CompleteGroupTaskEvent) {
    try {
      await this.firebaseService.messaging().sendEach([
        {
          topic: event.groupCode,
          notification: {
            title: `Task ${event.taskTitle} completed`,
            body: `Task completed by ${event.userName} in group ${event.groupName}`,
          },
          data: {
            groupId: event.groupId,
            groupName: event.groupName,
            userTokenDevice: event.userTokenDevice || '',
          },
          android: {
            notification: { 
              channelId: 'task-completed',
            }
          }
        },
      ]);
    } catch (error) {
      console.error(
        `Error sending task completed notification to group ${event.groupName}`,
        error,
      );
    }
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
}
