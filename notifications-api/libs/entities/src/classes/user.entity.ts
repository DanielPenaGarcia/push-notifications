import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany } from "typeorm";
import { AbstractEntity } from "./abstract.entity";
import { Task } from "./task.entity";
import { Group } from "./group.entity";
import { UserGroup } from "./user-groups.entity";
import { Notification } from "./notification.entity";

@Entity({
    name: 'users',
})
export class User extends AbstractEntity {

    @Column({
        type: 'varchar',
        length: 180,
        nullable: false,
    })
    email: string;

    @Column({
        type: 'varchar',
        length: 100,
        nullable: false,
    })
    providerId: string;

    @Column({
        type: 'varchar',
        length: 100,
        nullable: false,
    })
    provider: string;

    @OneToMany(() => Notification, notification => notification.user)
    notifications: Notification[];

    @OneToMany(() => Task, task => task.user)
    tasks: Task[];

    @OneToMany(() => UserGroup , userGroup => userGroup.user)
    userGroups: UserGroup[];

    @Column({
        name: 'token_device',
        type: 'varchar',
        length: 255,
        nullable: true,
    })
    tokenDevice: string;
}