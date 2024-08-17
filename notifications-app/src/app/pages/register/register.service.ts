import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { RegisterUserDTO } from './register.types';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {

  constructor(private readonly http: HttpClient) { }

  createUser(credentials: RegisterUserDTO): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth`, credentials);
  }
}
