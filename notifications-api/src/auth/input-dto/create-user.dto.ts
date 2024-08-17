import { IsString } from "class-validator";
import { IsNull } from "typeorm";

export class CreateUserDTO {
    @IsString()
    email: string;

    @IsString()
    providerId: string;

    @IsString()
    provider: string;
}