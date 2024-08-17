import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { AbstractEntity } from "./abstract.entity";
import { Group } from "./group.entity";
import { User } from "./user.entity";

@Entity('notifications')
export class Notification extends AbstractEntity{

    @Column({
        type: 'varchar',
        length: 255,
        nullable: false,
    })
    title: string;

    @Column({
        type: 'varchar',
        nullable: false,
        length: 255,
    })
    description: string;

    @ManyToOne(() => User, user => user.notifications)
    @JoinColumn({ 
        name: 'user_id',
        referencedColumnName: 'id'
    })
    user: User;

    @ManyToOne(() => Group, group => group.notifications)
    @JoinColumn({
        name: 'group_id',
        referencedColumnName: 'id'
    })
    group: Group;
}