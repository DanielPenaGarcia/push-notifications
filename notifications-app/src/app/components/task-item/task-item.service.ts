import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TaskDTO, ToggleTaskDTO } from './task-item.types';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TaskItemService {
  constructor(private readonly http: HttpClient) {}

  toggleTask(taskId: string, toggleTask: ToggleTaskDTO): Observable<TaskDTO> {
    return this.http.patch<TaskDTO>(
      `${environment.apiUrl}/tasks/${taskId}/toggle-status`,
      toggleTask
    );
  }

  deleteTask(taskId: string): Observable<TaskDTO> {
    return this.http.delete<TaskDTO>(`${environment.apiUrl}/tasks/${taskId}`);
  }
}
