import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { User } from 'firebase/auth';
import { jwtDecode } from 'jwt-decode';
import { PushNotificationsService } from '../notifications/push-notifications.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private readonly router: Router,
    private readonly firebaseAuthService: AngularFireAuth,
  ) {}

  async getUser(): Promise<User | undefined> {
    try {
      const userToken = localStorage.getItem('currentUser');
      if (userToken && !this.isTokenExpired(userToken)) {
        return jwtDecode(userToken);
      }
      const user = await this.firebaseAuthService.currentUser;
      return user || undefined;
    } catch (error) {
      return undefined;
    }
  }

  async signInWithEmailAndPassword(credentials: {
    email: string;
    password: string;
  }) {
    const currentUser =
      await this.firebaseAuthService.signInWithEmailAndPassword(
        credentials.email,
        credentials.password
      );
    this.getToken().then((token) => {
      localStorage.setItem('currentUser', token);
    });
    return currentUser;
  }

  async signOut(): Promise<void> {
    await this.firebaseAuthService.signOut();
    localStorage.removeItem('currentUser');
    this.router.navigate(['login']);
  }

  async registerUser(credentials: { email: string; password: string }) {
    const currentUser =
      await this.firebaseAuthService.createUserWithEmailAndPassword(
        credentials.email,
        credentials.password
      );
    this.getToken().then((token) => {
      localStorage.setItem('currentUser', token);
    });
    return currentUser;
  }

  async sendVerificationEmail(): Promise<any> {
    try {
      const user = await this.firebaseAuthService.currentUser;
      return user?.sendEmailVerification();
    } catch (error) {
      throw error;
    }
  }

  sendPasswordRecoveryEmail(passwordResetEmail: string): Promise<void> {
    return this.firebaseAuthService
      .sendPasswordResetEmail(passwordResetEmail)
      .then(() => {
        // TODO: RETURN ERROR TO COMPONENTS.
      })
      .catch((error) => {});
  }

  async isLoggedIn(): Promise<boolean> {
    const token = localStorage.getItem('currentUser');
    if (token && !this.isTokenExpired(token)) {
      return true;
    }
    this.signOut(); // Token expired, sign out user
    return false;
  }

  async isEmailVerified(): Promise<boolean> {
    const user = await this.firebaseAuthService.currentUser;
    return user !== null && user.emailVerified;
  }

  async getToken(): Promise<string | null> {
    return new Promise((resolve, reject) => {
      this.firebaseAuthService.idToken.subscribe({
        next: (token) => {
          resolve(token);
        },
        error: (error) => {
          reject(error);
        },
      });
    });
  }

  isTokenExpired(token: string): boolean {
    const decodedToken: any = jwtDecode(token);
    const expirationDate = new Date(0);
    expirationDate.setUTCSeconds(decodedToken.exp);
    return expirationDate < new Date();
  }
}
