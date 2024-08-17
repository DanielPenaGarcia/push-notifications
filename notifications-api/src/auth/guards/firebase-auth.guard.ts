import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { shouldBypassAuth } from 'notification/security/utils/bypass.auth';
import { Observable } from 'rxjs';

@Injectable()
export class FirebaseAuthGuard extends AuthGuard('bearer') {
  constructor(private reflector?: Reflector) {
    super();
  }

  override canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return (
      shouldBypassAuth(context, this.reflector) || super.canActivate(context)
    );
  }
}
