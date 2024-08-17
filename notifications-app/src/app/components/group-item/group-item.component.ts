import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GroupDTO } from './group-item.types';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { GroupTasksComponent } from '../group-tasks/group-tasks.component';
import { GroupItemService } from './group-item.service';
import { addIcons } from 'ionicons';
import { trash } from 'ionicons/icons';

@Component({
  selector: 'app-group-item',
  templateUrl: './group-item.component.html',
  styleUrls: ['./group-item.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
  providers: [GroupItemService],
})
export class GroupItemComponent implements OnInit {
  @Input() group: GroupDTO;
  @Output() groupDeleted = new EventEmitter<GroupDTO>();

  constructor(
    private readonly modalController: ModalController,
    private readonly groupItemService: GroupItemService
  ) {
    addIcons({ trash });
  }

  ngOnInit() {}

  async goToGroup() {
    const modal = await this.modalController.create({
      component: GroupTasksComponent,
      componentProps: {
        groupId: this.group.id,
        groupName: this.group.name,
      },
    });
    modal.present();
  }

  async deleteGroup() {
    this.groupItemService.deleteGroup(this.group.id).subscribe({
      next: (group: GroupDTO) => {
        this.groupDeleted.emit(group);
      },
      error: () => {
        console.log('Error deleting group');
      },
    });
  }
}
