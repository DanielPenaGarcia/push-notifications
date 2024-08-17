import { Body, Controller, Delete, Patch, Post, Put, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { Request } from 'express';
import { User } from 'notification/entities/classes/user.entity';
import { UpdateDeviceTokenDTO } from './input-dto/update-device-token.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('notification')
  async updateDeviceToken(@Req() req: Request, @Body() body: UpdateDeviceTokenDTO): Promise<any> {
    const userId = (req.user as User).id;
    return await this.usersService.updateTokenDevice(userId, body.tokenDevice);
  }

  @Delete('notification')
  async removeDeviceToken(@Req() req: Request): Promise<any> {
    const userId = (req.user as User).id;
    return await this.usersService.removeTokenDevice(userId);
  }
}
