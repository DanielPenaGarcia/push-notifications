import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'notification/entities/classes/user.entity';
import { Repository } from 'typeorm';
import {
  DEVICE_TOKEN_CHANGED_EVENT,
  DeviceTokenChangedEvent,
} from './events/device-token-changed.event';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async updateTokenDevice(userId: string, tokenDevice: string): Promise<User> {
    const user: User = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });
    if (!user) {
      throw new Error(`User with id ${userId} not found`);
    }
    const oldToken = user.tokenDevice;
    user.tokenDevice = tokenDevice;
    const userUpdated = await this.userRepository.save(user);
    const event: DeviceTokenChangedEvent = {
      userId: userId,
      oldToken: oldToken,
      newToken: tokenDevice,
    };
    this.eventEmitter.emit(DEVICE_TOKEN_CHANGED_EVENT, event);
    return userUpdated;
  }

  async removeTokenDevice(userId: string): Promise<User> {
    const user: User = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });
    if (!user) {
      throw new Error(`User with id ${userId} not found`);
    }
    const oldToken = user.tokenDevice;
    user.tokenDevice = null;
    const userUpdated = await this.userRepository.save(user);
    const event: DeviceTokenChangedEvent = {
      userId: userId,
      oldToken: oldToken,
      newToken: null,
    };
    this.eventEmitter.emit(DEVICE_TOKEN_CHANGED_EVENT, event);
    return userUpdated;
  }
}
