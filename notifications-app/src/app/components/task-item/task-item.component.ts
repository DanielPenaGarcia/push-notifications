import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TaskDTO } from './task-item.types';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { TaskItemService } from './task-item.service';
import { addIcons } from 'ionicons';
import { trash } from 'ionicons/icons';

@Component({
  standalone: true,
  selector: 'app-task-item',
  templateUrl: './task-item.component.html',
  styleUrls: ['./task-item.component.scss'],
  imports: [IonicModule, CommonModule],
  providers: [TaskItemService],
})
export class TaskItemComponent implements OnInit {

  @Input() task: TaskDTO;
  @Output() taskDeleted = new EventEmitter<TaskDTO>();

  constructor(private readonly taskItemService: TaskItemService) {
    addIcons({ trash });
  }

  ngOnInit() {}

  toggleTask(event: any) {
    event.target.disabled = true;
    const isCheked = event.detail.checked;
    this.taskItemService
      .toggleTask(this.task.id, { status: isCheked })
      .subscribe({
        next: (task: TaskDTO) => {
          this.task = task;
          event.target.disabled = false;
        },
        error: () => {
          event.target.disabled = false;
        },
      });
  }

  deleteTask() {
    this.taskItemService.deleteTask(this.task.id).subscribe({
      next: (task) => {
        this.taskDeleted.emit(task);
      },
      error: () => {
        console.log('Error deleting task');
      },
    });
  }
}
