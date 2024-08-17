import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from 'src/app/shared/auth/auth.service';
import { LoginService } from './login.service';
import { PushNotificationsService } from 'src/app/shared/notifications/push-notifications.service';
import { push } from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule, FormsModule],
  providers: [LoginService]
})
export class LoginPage implements OnInit {

  loginForm:FormGroup;

  constructor(
    private readonly _router: Router,
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly loginService: LoginService,
    private readonly pushNotificationsService: PushNotificationsService
  ) {}

  ngOnInit() {
    this.createLoginForm();
  }

  createLoginForm() {
    this.loginForm = this.formBuilder.group({
      email: [''],
      password: ['']
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  async loginSubmit(){
    const email = this.email.value;
    const password = this.password.value;
    this.authService.signInWithEmailAndPassword({email, password}).then((userCredentials) => {
      this.loginService.verifyUserExists(email).subscribe((response) => {
        if(response) {
          this.pushNotificationsService.initPushNotifications();
          this._router.navigate(['']);
        }
        if(!response) {
          const providerId = userCredentials.user.uid;
          const provider = userCredentials.user.providerId;
          this.loginService.registerUser({email, providerId, provider}).subscribe((response) => {
            if(response) {
              this.pushNotificationsService.initPushNotifications();
              this._router.navigate(['']);
            }else {
              console.error('Error registering user');
            }
          })
        }
      });
    }).catch((error) => {
      console.error(error);
    });
  }

  registerSubmit() {
    this._router.navigate(['/register']);
  }
}
