import { Module } from '@nestjs/common';
import { EntitiesModule } from 'notification/entities';
import { UtilsModule } from 'notification/utils';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FirebaseAuthStrategy } from './strategies/firebase-auth.strategy';

@Module({
  imports: [EntitiesModule, UtilsModule],
  controllers: [AuthController],
  providers: [AuthService, FirebaseAuthStrategy],
})
export class AuthModule {}
