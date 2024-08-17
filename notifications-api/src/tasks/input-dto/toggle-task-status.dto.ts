import { IsBoolean } from "class-validator";

export class ToggleTaskStatus {
    @IsBoolean()
    status: boolean;
}