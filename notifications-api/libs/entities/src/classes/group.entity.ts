import { Column, Entity, ManyToMany, OneToMany } from "typeorm";
import { AbstractEntity } from "./abstract.entity";
import { UserGroup } from "./user-groups.entity";
import { Task } from "./task.entity";
import { Notification } from "./notification.entity";

@Entity('groups')
export class Group extends AbstractEntity {

    @Column({
        name: 'name',
        type: 'varchar',
        length: 100,
    })
    name: string;

    @Column({
        name: 'code',
        type: 'varchar',
        length: 100,
        unique: true,
    })
    code: string;

    @OneToMany(() => UserGroup, userGroup => userGroup.group)
    userGroups: UserGroup[];

    @OneToMany(() => Task, task => task.group)
    tasks: Task[];

    @OneToMany(() => Notification, notification => notification.group)
    notifications: Notification[];
}