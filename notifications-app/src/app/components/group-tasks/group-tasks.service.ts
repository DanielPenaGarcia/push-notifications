import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { TaskDTO } from './group-tasks.types';

@Injectable({
  providedIn: 'root',
})
export class GroupTasksService {

  searchParams = {
    page: 0,
    limit: 10,
  };

  constructor(private readonly http: HttpClient) {}

  createTask(task: TaskDTO, groupId: string): Observable<TaskDTO> {
    return this.http.post<TaskDTO>(`${environment.apiUrl}/groups/${groupId}/tasks`, task);
  }

  findTasksByGroup(groupId: string): Observable<TaskDTO[]> {
    return this.http.get<TaskDTO[]>(
      `${environment.apiUrl}/groups/${groupId}/tasks`, {
        params: <any>this.searchParams,
      }
    );
  }

  completeTask(taskId: string): Observable<TaskDTO> {
    const body = { taskId };
    return this.http.put<TaskDTO>(`${environment.apiUrl}/tasks/complete`, body);
  }
}
