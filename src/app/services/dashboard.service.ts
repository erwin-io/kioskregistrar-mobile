import { Injectable } from '@angular/core';
import { IServices } from './interface/iservices';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../model/api-response.model';
import { AppConfigService } from './app-config.service';
import { Request } from '../model/request';

@Injectable({
  providedIn: 'root'
})
export class DashboardService implements IServices {

  constructor(private http: HttpClient, private appconfig: AppConfigService) { }
  getMemberDashboard(memberId: string): Observable<ApiResponse<{
    pending: {
      total: number;
      prio: Request;
    };
    toPay: {
      total: number;
      prio: Request;
    };
    toComplete: {
      total: number;
      prio: Request;
    };
    processing: {
      total: number;
      prio: Request;
    };
  }>> {
    return this.http.get<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.dashboard.getMemberDashboard + memberId)
    .pipe(
      tap(_ => this.log('dashboard')),
      catchError(this.handleError('dashboard', []))
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
