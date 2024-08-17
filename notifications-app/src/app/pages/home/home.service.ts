import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TaskDTO } from './home.types';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  searchParams = {
    page: 0,
    limit: 10,
  };

  constructor(private readonly http: HttpClient) {}

  createTask(task: TaskDTO): Observable<TaskDTO> {
    return this.http.post<TaskDTO>(`${environment.apiUrl}/tasks`, task);
  }

  getTasks(): Observable<TaskDTO[]> {
    return this.http.get<TaskDTO[]>(`${environment.apiUrl}/tasks`, {
      params: <any>this.searchParams,
    });
  }
}
