import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { AddGroupDTO, CreateGroupDTO, GroupDTO } from './group.types';
import { AlertController } from '@ionic/angular';
import { GroupsService } from './groups.service';
import { InfiniteScrollCustomEvent } from '@ionic/core';
import { GroupTasksComponent } from 'src/app/components/group-tasks/group-tasks.component';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { GroupItemComponent } from 'src/app/components/group-item/group-item.component';
import { PushNotificationsService } from 'src/app/shared/notifications/push-notifications.service';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.page.html',
  styleUrls: ['./groups.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, HeaderComponent, GroupItemComponent],
  providers: [GroupsService],
})
export class GroupsPage implements OnInit {
  @ViewChild('headerComponent') headerComponent: HeaderComponent;
  groups: GroupDTO[] = [];
  headerTitle = 'Groups';

  constructor(
    private readonly alertController: AlertController,
    private readonly groupsService: GroupsService,
    private cdr: ChangeDetectorRef,
    private readonly modalController: ModalController,
  ) {}

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.findGroups();
    this.headerComponent.ngOnInit();
  }

  ionViewWillLeave() {
    this.groups = [];
  }

  async goToGroup(group: GroupDTO) {
    const modal = await this.modalController.create({
      component: GroupTasksComponent,
      componentProps: {
        groupId: group.id,
        groupName: group.name,
      }
    });
    modal.present();
  }

  findGroups() {
    this.groupsService.findGroups().subscribe({
      next: (groups) => {
        Array.prototype.push.apply(this.groups, groups);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error fetching groups', error);
      },
    });
  }

  async createGroup(group: any) {
    const createGroupDTO: CreateGroupDTO = {
      name: group.name,
      code: group.code,
    };
    this.groupsService.createGroup(createGroupDTO).subscribe({
      next: (group) => {
        this.groups.push(group);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error creating group', error.error.message);
      },
    });
  }

  async addGroup(group: any) {
    const addGroupDTO: AddGroupDTO = {
      groupCode: group.code,
    };
    this.groupsService.addGroupWithCode(addGroupDTO).subscribe({
      next: (group) => {
        this.groups.push(group);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error adding group', error);
      },
    });
  }

  async createGroupAlert() {
    const alert = this.alertController.create({
      header: 'Create Group',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Name',
        },
        {
          name: 'code',
          type: 'text',
          placeholder: 'Code',
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          htmlAttributes: {
            color: 'primary',
            fill: 'outline',
          },
        },
        {
          text: 'Create',
          role: 'create',
          htmlAttributes: {
            color: 'success',
            fill: 'solid',
          },
          handler: (data) => this.createGroup(data),
        },
      ],
    });
    (await alert).present();
  }

  async addGroupAlert() {
    const alert = this.alertController.create({
      header: 'Add Group',
      inputs: [
        {
          name: 'code',
          type: 'text',
          placeholder: 'Code',
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          htmlAttributes: {
            color: 'primary',
            fill: 'outline',
          },
        },
        {
          text: 'Add',
          role: 'add',
          htmlAttributes: {
            color: 'success',
            fill: 'solid',
          },
          handler: (data) => this.addGroup(data),
        },
      ],
    });
    (await alert).present();
  }

  onIonInfinite(event: any){
    this.groupsService.searchParams.page++;
    this.findGroups();
    setTimeout(() => {
      (event as InfiniteScrollCustomEvent).target.complete();
    }, 500);
  }

  onGroupDeleted(groupDeleted: GroupDTO) {
    this.groups = this.groups.filter((group) => group.id !== groupDeleted.id);
    this.cdr.detectChanges();
  }
}
