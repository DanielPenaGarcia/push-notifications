export class CreateTaskGroupEvent {
    userId: string;
    groupId: string;
    taskTitle: string;
}

export const CREATE_TASK_GROUP_EVENT = 'task.created.for.group';