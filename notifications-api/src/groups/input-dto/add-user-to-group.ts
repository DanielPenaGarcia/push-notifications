import { IsString } from "class-validator";

export class AddUserToGroupDTO {
  @IsString()
  groupCode: string;
}