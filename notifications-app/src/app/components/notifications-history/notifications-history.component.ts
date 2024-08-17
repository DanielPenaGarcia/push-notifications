import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { PushNotificationsService } from 'src/app/shared/notifications/push-notifications.service';
import { NotificationDTO } from './notifications-history.types';
import { GroupTasksComponent } from '../group-tasks/group-tasks.component';
import { addIcons } from 'ionicons';
import { closeOutline, trash } from 'ionicons/icons';
import { NotificationsHistoryService } from './notifications-history.service';

@Component({
  standalone: true,
  selector: 'app-notifications-history',
  templateUrl: './notifications-history.component.html',
  styleUrls: ['./notifications-history.component.scss'],
  imports: [IonicModule, CommonModule],
  providers: [NotificationsHistoryService],
})
export class NotificationsHistoryComponent implements OnInit {
  notifications: NotificationDTO[] = [];

  constructor(
    private readonly modalController: ModalController,
    private readonly notificationsHistoryService: NotificationsHistoryService
  ) {
    addIcons({ closeOutline, trash });
  }

  ngOnInit() {
    this.getDeliveredNotifications();
  }

  close() {
    this.modalController.dismiss();
  }

  async openGroupNotification(notification: NotificationDTO) {
    const modal = await this.modalController.create({
      component: GroupTasksComponent,
      componentProps: {
        groupId: notification.group.id,
        groupName: notification.group.name,
      },
    });
    modal.present();
  }

  getDeliveredNotifications() {
    this.notificationsHistoryService
      .getDeliveredNotifications()
      .subscribe((notifications) => {
        Array.prototype.push.apply(this.notifications, notifications);
      });
  }

  removeNotification(notification: NotificationDTO) {
    this.notificationsHistoryService
      .removeNotification(notification.id)
      .subscribe({
        next: (notificationDeleted: NotificationDTO) => {
          this.notifications = this.notifications.filter(
            (notification) => notification.id !== notificationDeleted.id
          );
        },
        error: (error) => {
          console.error('Error removing notification: ', error);
        },
      });
  }
}
