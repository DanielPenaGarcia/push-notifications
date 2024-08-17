import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NotificationDTO } from './notifications-history.types';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NotificationsHistoryService {
  searchParams = {
    page: 0,
    limit: 10,
  };

  constructor(private readonly http: HttpClient) {}

  getDeliveredNotifications(): Observable<NotificationDTO[]> {
    return this.http.get<NotificationDTO[]>(
      `${environment.apiUrl}/notifications`,
      {
        params: <any>this.searchParams,
      }
    );
  }

  removeNotification(notificationId: string): Observable<NotificationDTO> {
    return this.http.delete<NotificationDTO>(
      `${environment.apiUrl}/notifications/${notificationId}`
    );
  }
}
