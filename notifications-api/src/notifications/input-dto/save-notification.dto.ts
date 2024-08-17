import { IsString } from "class-validator";

export class SaveNotificationDTO {
    @IsString()
    title: string;

    @IsString()
    description: string;

    @IsString()
    groupId: string;
}