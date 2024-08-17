import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { InfiniteScrollCustomEvent } from '@ionic/core';
import { TaskDTO } from './group-tasks.types';
import { GroupTasksService } from './group-tasks.service';
import { TaskItemComponent } from '../task-item/task-item.component';
import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-group-tasks',
  templateUrl: './group-tasks.component.html',
  styleUrls: ['./group-tasks.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, TaskItemComponent],
  providers: [GroupTasksService],
})
export class GroupTasksComponent implements OnInit {
  @Input() groupName: string;
  @Input() groupId: string;
  tasks: TaskDTO[] = [];

  constructor(
    private readonly groupTasksService: GroupTasksService,
    private readonly alertController: AlertController,
    private cdr: ChangeDetectorRef,
    private readonly modalController: ModalController
  ) {
    addIcons({ closeOutline });
  }

  ngOnInit() {
    this.getTaskByGroup();
  }

  ngOnDestroy() {
    this.tasks = [];
  }

  getTaskByGroup() {
    this.groupTasksService.findTasksByGroup(this.groupId).subscribe({
      next: (tasks) => {
        Array.prototype.push.apply(this.tasks, tasks);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error fetching tasks', error);
        this.closeModal();
      },
    });
  }

  completeTaskEvent(event, taskId: string) {
    this.completeTask(taskId).then((response) => {
      const taskIndex = this.tasks.findIndex((task) => task.id === response.id);
      this.tasks[taskIndex] = response;
      this.cdr.detectChanges();
    });
  }

  async completeTask(taskId: string): Promise<TaskDTO> {
    return new Promise((resolve, reject) => {
      this.groupTasksService.completeTask(taskId).subscribe((response) => {
        resolve(response);
      });
    });
  }

  uploadTask(task: any) {
    const taskDTO: TaskDTO = {
      title: task.title,
      description: task.description,
      completed: false,
      id: undefined,
    };
    this.groupTasksService
      .createTask(taskDTO, this.groupId)
      .subscribe((response) => {
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

  onIonInfinite(event: any) {
    this.groupTasksService.searchParams.page++;
    this.getTaskByGroup();
    setTimeout(() => {
      (event as InfiniteScrollCustomEvent).target.complete();
    }, 500);
  }

  closeModal() {
    this.modalController.dismiss();
  }

  onTaskDeleted(deletedTask: TaskDTO) {
    this.tasks = this.tasks.filter((task) => task.id !== deletedTask.id);
    this.cdr.detectChanges();
  }
}
