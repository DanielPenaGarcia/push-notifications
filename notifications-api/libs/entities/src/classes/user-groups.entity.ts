import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { User } from './user.entity';
import { Group } from './group.entity';

@Entity('')
export class UserGroup extends AbstractEntity {
  @ManyToOne(() => User, (user) => user.userGroups)
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
  })
  user: User;

  @ManyToOne(() => Group, (group) => group.userGroups)
  @JoinColumn({
    name: 'group_id',
    referencedColumnName: 'id',
  })
  group: Group;
}
