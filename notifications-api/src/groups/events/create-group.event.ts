export class CreateGroupEvent {
    groupId: string;
    userId: string;
}

export const CREATE_GROUP_EVENT = 'group.created';