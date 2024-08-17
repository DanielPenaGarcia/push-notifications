import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { User } from './user.entity';
import { Group } from './group.entity';

@Entity({
  name: 'tasks',
})
export class Task extends AbstractEntity {
  @Column({
    type: 'varchar',
    length: 40,
    nullable: false,
  })
  title: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  description: string;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
  })
  completed: boolean;

  @ManyToOne(() => User, user => user.tasks)
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
  })
  user: User;

  @ManyToOne(() => Group, group => group.tasks)
  @JoinColumn({
    name: 'group_id',
    referencedColumnName: 'id',
  })
  group: Group;

  constructor(title: string, description: string, user: User) {
    super();
    this.title = title;
    this.description = description;
    this.user = user;
  }
}
