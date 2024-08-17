import { IsNotEmpty, IsString } from "class-validator";

export class GroupId {
  @IsNotEmpty()
  @IsString()
  groupId: string;
}