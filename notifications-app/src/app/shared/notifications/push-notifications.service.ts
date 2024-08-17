import { HttpClient } from '@angular/common/http';
import { Injectable, Optional, SkipSelf } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  NotificationDTO,
  SaveNotificationDTO,
} from './push-notifications.types';
import { ModalController } from '@ionic/angular';
import { GroupTasksComponent } from 'src/app/components/group-tasks/group-tasks.component';

@Injectable({
  providedIn: 'root',
})
export class PushNotificationsService {
  private tokenDevice: string;
  notificationReceived = new Subject<NotificationDTO>();

  constructor(
    @Optional() @SkipSelf() sharedService: PushNotificationsService,
    private readonly http: HttpClient,
    private readonly modalController: ModalController
  ) {
    if (sharedService) {
      throw new Error('PushNotificationsService is already provided');
    }
  }

  async initPushNotifications() {
    const platform = Capacitor.getPlatform();
    if (platform === 'web') {
      return;
    }
    await this.registerNotifications();
    await this.addListeners();
    await this.createChannels();
  }

  getTokenDevice(): string {
    return this.tokenDevice;
  }

  async registerNotifications() {
    let status = await PushNotifications.checkPermissions();
    if (status.receive === 'prompt') {
      status = await PushNotifications.requestPermissions();
    }
    if (status.receive !== 'granted') {
      throw new Error('User denied permissions!');
    }
    await PushNotifications.register();
    return Promise.resolve();
  }

  async addListeners() {
    await PushNotifications.addListener('registration', (token) => {
      this.tokenDevice = token.value;
      this.registerToken().subscribe({
        next: () => {
          console.log('Token registered successfully');
        },
        error: (error) => {
          console.error('Error registering the device', error);
        },
      });
    });
    await PushNotifications.addListener('registrationError', (error) => {
      this.sendDeleteToken().subscribe({
        next: () => {
          console.log('Token deleted successfully');
        },
        error: (error) => {
          console.error('Error registering the device', error);
        },
      });
    });
    await PushNotifications.addListener(
      'pushNotificationReceived',
      (notification) => {
        if (notification.data.userTokenDevice !== this.tokenDevice) {
          const groupId = notification.data.groupId;
          const saveNotificationDTO: SaveNotificationDTO = {
            title: notification.title,
            description: notification.body,
            groupId: groupId,
          };
          this.saveNotification(saveNotificationDTO).subscribe({
            next: (response) => {
              this.notificationReceived.next(response);
            },
            error: (error) => {
              console.error('Error saving notification', error);
            },
          });
        }
      }
    );
    await PushNotifications.addListener(
      'pushNotificationActionPerformed',
      async (notification) => {
        const action = notification.actionId;
        if (action === 'tap') {
          this.modalController.dismiss();
          const groupId = notification.notification.data.groupId;
          const groupName = notification.notification.data.groupName;
          const modal = await this.modalController.create({
            component: GroupTasksComponent,
            componentProps: {
              groupId: groupId,
              groupName: groupName,
            },
          });
          modal.present();
        }
      }
    );
    return Promise.resolve();
  }

  async createChannels() {
    await PushNotifications.createChannel({
      id: 'group',
      name: 'Group notifications',
      description: 'Group notifications',
      importance: 5,
      visibility: 1,
    });
    await PushNotifications.createChannel({
      id: 'task-created',
      name: 'Task created',
      description: 'Task created',
      importance: 2,
      visibility: 0,
    });
    await PushNotifications.createChannel({
      id: 'task-completed',
      name: 'Task completed',
      description: 'Task completed',
      importance: 5,
      visibility: 1,
    });
    return Promise.resolve();
  }

  registerToken(): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/users/notification`, {
      tokenDevice: this.tokenDevice,
    });
  }

  sendDeleteToken(): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrl}/users/notification`);
  }

  saveNotification(
    notification: SaveNotificationDTO
  ): Observable<NotificationDTO> {
    return this.http.post<NotificationDTO>(
      `${environment.apiUrl}/notifications`,
      notification
    );
  }
}
