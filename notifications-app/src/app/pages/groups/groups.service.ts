import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AddGroupDTO, CreateGroupDTO, GroupDTO } from './group.types';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GroupsService {
  searchParams = {
    page: 0,
    limit: 10,
  };

  constructor(private readonly http: HttpClient) {}

  createGroup(createGroupDTO: CreateGroupDTO): Observable<GroupDTO> {
    return this.http.post<GroupDTO>(
      `${environment.apiUrl}/groups`,
      createGroupDTO
    );
  }

  findGroups(): Observable<GroupDTO[]> {
    return this.http.get<GroupDTO[]>(`${environment.apiUrl}/groups`, {
      params: <any>this.searchParams,
    });
  }

  addGroupWithCode(addGroupDTO: AddGroupDTO): Observable<GroupDTO> {
    return this.http.post<GroupDTO>(`${environment.apiUrl}/groups/add-group`, addGroupDTO);
  }
}
