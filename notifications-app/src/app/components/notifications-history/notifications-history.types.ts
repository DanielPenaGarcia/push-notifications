export interface NotificationDTO {
    id: string;
    title: string;
    description: string;
    group: GroupDTO;
}

export interface GroupDTO {
    id: string;
    name: string;
}

export interface RemoveNotificationDTO {
    notificationId: string;
}