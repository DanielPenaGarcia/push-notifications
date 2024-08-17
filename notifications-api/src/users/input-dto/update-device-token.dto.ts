import { IsString } from "class-validator";

export class UpdateDeviceTokenDTO {
    @IsString()
    tokenDevice: string;
}