/* eslint-disable max-len */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../model/api-response.model';
import { UserOneSignalSubscription } from '../model/user-one-signal-subscription.model';
import { AppConfigService } from './app-config.service';
import { IServices } from './interface/iservices';

@Injectable({
  providedIn: 'root'
})
export class UserOneSignalSubscriptionService implements IServices {

  constructor(private http: HttpClient, private appconfig: AppConfigService) { }

  getBySubscriptionId(subscriptionId): Observable<ApiResponse<UserOneSignalSubscription>> {
    return this.http.get<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.userOneSignalSubscription.getBySubscriptionId + subscriptionId)
    .pipe(
      tap(_ => this.log('user-one-signal-subscription')),
      catchError(this.handleError('user-one-signal-subscription', []))
    );
  }

  create(data: { userId: string; subscriptionId: string }): Observable<ApiResponse<UserOneSignalSubscription>> {
    return this.http.post<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.userOneSignalSubscription.create, data)
    .pipe(
      tap(_ => this.log('user-one-signal-subscription')),
      catchError(this.handleError('user-one-signal-subscription', []))
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
