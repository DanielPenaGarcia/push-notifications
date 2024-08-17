import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'notification/entities/classes/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDTO } from './input-dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  async createUser(createUserDTO: CreateUserDTO): Promise<User> {
    return await this.usersRepository.save(createUserDTO);
  }

  async getUserByEmail(email: string): Promise<User> {
    return await this.usersRepository.findOne({
      where: {
        email: email,
      },
    });
  }
}
