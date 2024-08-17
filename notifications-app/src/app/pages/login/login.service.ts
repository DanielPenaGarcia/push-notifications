import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  constructor(private readonly http: HttpClient) {}

  verifyUserExists(email: string): Observable<object> {
    const userParams = { email };
    return this.http.get(`${environment.apiUrl}/auth`, {
      params: <any>userParams,
    });
  }

  registerUser(user: object): Observable<object> {
    return this.http.post(`${environment.apiUrl}/auth`, user);
  }
}
