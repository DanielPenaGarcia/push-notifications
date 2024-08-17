export class DeviceTokenChangedEvent {
    userId: string;
    oldToken: string;
    newToken: string;
}

export const DEVICE_TOKEN_CHANGED_EVENT = 'device.token.changed';