import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

/** 
 * Simple authentication guard to avoid navigation to routes when
 * user data is required. This uses authService as provider to know
 * if a user has logged in or not 
 * */
export const authGuard = async() => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if(await authService.isLoggedIn()){
    return true;
  }
  return router.parseUrl("/login");
};