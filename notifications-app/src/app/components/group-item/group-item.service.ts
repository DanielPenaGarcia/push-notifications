import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GroupDTO } from './group-item.types';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GroupItemService {

  constructor(
    private readonly http: HttpClient
  ) { }

  deleteGroup(groupId: string): Observable<GroupDTO> {
    return this.http.delete<GroupDTO>(`${environment.apiUrl}/groups/${groupId}`);
  }
}
