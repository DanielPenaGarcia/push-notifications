import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { EntitiesModule } from 'notification/entities';
import { DeviceTokenChangedListener } from './listeners/device-token-changed.listener';
import { UtilsModule } from 'notification/utils';

@Module({
  imports: [EntitiesModule, UtilsModule],
  controllers: [UsersController],
  providers: [UsersService, DeviceTokenChangedListener],
})
export class UsersModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer.apply().forRoutes(UsersController);
  }
}
