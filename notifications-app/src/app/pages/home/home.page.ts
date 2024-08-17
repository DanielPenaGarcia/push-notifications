import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { InfiniteScrollCustomEvent } from '@ionic/core';
import { TaskDTO } from './home.types';
import { AlertController } from '@ionic/angular';
import { HomeService } from './home.service';
import { PushNotificationsService } from 'src/app/shared/notifications/push-notifications.service';
import { AuthService } from 'src/app/shared/auth/auth.service';
import { TaskItemComponent } from 'src/app/components/task-item/task-item.component';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TaskItemComponent,
    HeaderComponent,
  ],
  providers: [HomeService],
})
export class HomePage implements OnInit {
  constructor(
    private readonly alertController: AlertController,
    private readonly homeService: HomeService,
    private readonly cdr: ChangeDetectorRef,
    private readonly authService: AuthService,
  ) {}

  @ViewChild('headerComponent') headerComponent: HeaderComponent;
  headerTitle = 'My Tasks';
  tasks: TaskDTO[] = [];

  ngOnInit() {
    this.notificationsRequest();
  }

  ionViewWillEnter() {
    this.getTasks();
    this.headerComponent.ngOnInit();
  }

  ionViewWillLeave() {
    this.tasks = [];
  }

  private getTasks() {
    this.homeService.getTasks().subscribe((response) => {
      Array.prototype.push.apply(this.tasks, response);
      this.cdr.detectChanges();
    });
  }

  private async notificationsRequest() {
  }

  onIonInfinite(event: any) {
    this.homeService.searchParams.page++;
    this.getTasks();
    setTimeout(() => {
      (event as InfiniteScrollCustomEvent).target.complete();
    }, 500);
  }

  uploadTask(task: any) {
    const taskDTO: TaskDTO = {
      title: task.title,
      description: task.description,
      completed: false,
      id: undefined,
    };
    this.homeService.createTask(taskDTO).subscribe((response) => {
      this.tasks.push(response);
      this.cdr.detectChanges();
    });
  }

  async createTask() {
    const alert = this.alertController.create({
      inputs: [
        {
          name: 'title',
          type: 'text',
          placeholder: 'Title',
        },
        {
          name: 'description',
          type: 'text',
          placeholder: 'Description',
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Create',
          handler: (data) => {
            this.uploadTask(data);
          },
        },
      ],
      header: 'Create Task',
    });
    (await alert).present();
  }

  signOut() {
    this.authService.signOut();
  }

  onTaskDeleted(deletedTask: TaskDTO) {
    this.tasks = this.tasks.filter((task) => task.id !== deletedTask.id);
    this.cdr.detectChanges();
  }
}
