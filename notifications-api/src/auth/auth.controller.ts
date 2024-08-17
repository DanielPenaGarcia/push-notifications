import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { BypassAuth } from 'notification/security/utils/bypass.auth';
import { CreateUserDTO } from './input-dto/create-user.dto';
import { User } from 'notification/entities/classes/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @BypassAuth()
  @Post()
  async createUser(@Body() body: CreateUserDTO): Promise<User> {
    return this.authService.createUser(body);
  }
  
  @BypassAuth()
  @Get()
  async getUserByEmail(@Query() query: any): Promise<User> {
    return this.authService.getUserByEmail(query.email);
  }
}
