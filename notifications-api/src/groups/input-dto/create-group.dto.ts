import { IsString } from "class-validator";

export class CreateGroupDTO {
  @IsString()
  name: string;

  @IsString()
  code: string;
}