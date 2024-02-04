import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../model/api-response.model';
import { AppConfigService } from './app-config.service';
import { IServices } from './interface/iservices';
import { Notifications } from '../model/notifications';

@Injectable({
  providedIn: 'root'
})
export class NotificationService implements IServices {

  constructor(private http: HttpClient, private appconfig: AppConfigService) { }

  getUnreadByUser(userCode: string): Observable<ApiResponse<any>> {
    return this.http.get<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.notifications.getUnreadByUser + userCode)
    .pipe(
      tap(_ => this.log('notifications')),
      catchError(this.handleError('notifications', []))
    );
  }

  getByAdvanceSearch(params: {
    order: any;
    columnDef: { apiNotation: string; filter: string }[];
    pageSize: number;
    pageIndex: number;
  }): Observable<ApiResponse<{ results: Notifications[]; total: number}>> {
    return this.http.post<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.notifications.getByAdvanceSearch,
      params)
    .pipe(
      tap(_ => this.log('notifications')),
      catchError(this.handleError('notifications', []))
    );
  }

  marAsRead(notificationId) {
    return this.http.put<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.notifications.marAsRead + notificationId, {})
    .pipe(
      tap(_ => this.log('notifications')),
      catchError(this.handleError('notifications', []))
    );
  }

  handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      this.log(`${operation} failed: ${Array.isArray(error.error.message) ? error.error.message[0] : error.error.message}`);
      return of(error.error as T);
    };
  }

  log(message: string) {
    console.log(message);
  }
}
