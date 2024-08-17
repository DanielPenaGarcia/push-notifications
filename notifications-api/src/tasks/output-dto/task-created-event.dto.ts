export class TaskCreatedEvent {
    taskId: string;
    email: string;
    constructor(taskId: string, email: string) {
        this.taskId = taskId;
        this.email = email;
    }
}