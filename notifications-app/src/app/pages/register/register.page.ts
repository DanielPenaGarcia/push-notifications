import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/auth/auth.service';
import { PushNotificationsService } from 'src/app/shared/notifications/push-notifications.service';
import { RegisterService } from './register.service';
import { RegisterUserDTO } from './register.types';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  providers: [RegisterService],
})
export class RegisterPage implements OnInit {
  loginForm: FormGroup;

  constructor(
    private readonly _router: Router,
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly registerService: RegisterService,
    private readonly pushNotificationsService: PushNotificationsService
  ) {}

  ngOnInit() {
    this.createLoginForm();
  }

  createLoginForm() {
    this.loginForm = this.formBuilder.group({
      email: [''],
      password: [''],
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  registerSubmit() {
    const email = this.email.value;
    const password = this.password.value;
    this.authService.registerUser({ email, password}).then(userCredential => {
      const user = userCredential.user;
      const registerUserDTO : RegisterUserDTO = {
        email: user.email,
        providerId: user.uid,
        provider: user.providerId
      };
      this.registerService.createUser(registerUserDTO).subscribe({
        next: (response) => {
          this.pushNotificationsService.initPushNotifications();
          this._router.navigate(['']);
        },
        error: (error) => {
          console.error('Error creating user: ', error);
        }
      })
    });
  }

  loginSubmit() {
    this._router.navigate(['/login']);
  }
}
