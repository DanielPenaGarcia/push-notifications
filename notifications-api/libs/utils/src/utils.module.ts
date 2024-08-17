import { Module } from '@nestjs/common';
import { UtilsService } from './utils.service';
import { firebaseAdminProvider } from './providers/firebase-admin.provider';

@Module({
  providers: [UtilsService, firebaseAdminProvider],
  exports: [UtilsService, firebaseAdminProvider],
})
export class UtilsModule {}
