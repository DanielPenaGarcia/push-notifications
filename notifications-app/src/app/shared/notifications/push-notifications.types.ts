export interface NotificationDTO {
    title: string;
    description: string;
    group: GroupDTO;
}

export interface SaveNotificationDTO {
    title: string;
    description: string;
    groupId: string;
}

export interface GroupDTO {
    id: string;
    name: string;
}