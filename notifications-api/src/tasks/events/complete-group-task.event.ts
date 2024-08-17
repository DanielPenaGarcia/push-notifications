export class CompleteGroupTaskEvent { 
    userName: string;
    groupCode: string;
    groupId: string;
    groupName: string;
    userTokenDevice: string;
    taskTitle: string;
}

export const COMPLETE_GROUP_TASK_EVENT = 'group.task.completed';