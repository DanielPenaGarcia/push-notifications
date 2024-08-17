import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { closeCircle, notifications, logOut } from 'ionicons/icons';
import { AuthService } from 'src/app/shared/auth/auth.service';
import { NotificationsHistoryComponent } from '../notifications-history/notifications-history.component';
import { Capacitor } from '@capacitor/core';
import { PushNotificationsService } from 'src/app/shared/notifications/push-notifications.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
  providers: [],
})
export class HeaderComponent implements OnInit {
  isMobile = false;
  @Input() title: string;
  hasNotifications = false;
  private notificationSubscription: Subscription;

  constructor(
    private readonly modalController: ModalController,
    private cdr: ChangeDetectorRef,
    private pushNotificationsService: PushNotificationsService,
    private authService: AuthService
  ) {
    addIcons({ closeCircle, notifications, logOut });
  }

  ngOnInit() {
    this.isMobileDevice();
    this.suscribeToNotification();
    this.notificationReceivedAlreadySeen();
  }

  signOut() {
    this.pushNotificationsService.sendDeleteToken().subscribe({
      next: () => {
        this.authService.signOut();
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  async suscribeToNotification() {
    this.notificationSubscription =
      this.pushNotificationsService.notificationReceived.subscribe({
        next: (notification) => {
          if(notification) {
            this.hasNotifications = true;
            this.cdr.detectChanges();
          }else{
            this.hasNotifications = false;
            this.cdr.detectChanges();
          }
        },
        error: (error) => {
          console.error(error);
        },
      });
  }

  notificationReceivedAlreadySeen() {
    if(this.hasNotifications) {
      this.hasNotifications = false;
      this.pushNotificationsService.notificationReceived.next(null);
    }
  }

  async notifications() {
    const modal = await this.modalController.create({
      component: NotificationsHistoryComponent,
    });
    if (this.hasNotifications) {
      this.hasNotifications = false;
    }
    await modal.present();
  }

  isMobileDevice() {
    const platform = Capacitor.getPlatform();
    if (platform !== 'web') {
      this.isMobile = true;
    }
  }
}
