import { IsString } from "class-validator";

export class CreateTaskForGroupDTO {
    @IsString()
    title: string;

    @IsString()
    description: string;
}