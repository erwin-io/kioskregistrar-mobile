import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../model/api-response.model';
import { RequestRequirements } from '../model/request-requirements';
import { AppConfigService } from './app-config.service';
import { IServices } from './interface/iservices';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RequestRequirementsService implements IServices {

  constructor(private http: HttpClient, private appconfig: AppConfigService) { }

  get(requestTypeId: string): Observable<ApiResponse<RequestRequirements[]>> {
    return this.http.get<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.requestRequirements.get + requestTypeId)
    .pipe(
      tap(_ => this.log('requestRequirements')),
      catchError(this.handleError('requestRequirements', []))
    );
  }

  getById(requestTypeId: string): Observable<ApiResponse<RequestRequirements>> {
    return this.http.get<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.requestRequirements.getById + requestTypeId)
    .pipe(
      tap(_ => this.log('requestRequirements')),
      catchError(this.handleError('requestRequirements', []))
    );
  }

  create(data: any): Observable<ApiResponse<RequestRequirements>> {
    return this.http.post<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.requestRequirements.create, data)
    .pipe(
      tap(_ => this.log('requestRequirements')),
      catchError(this.handleError('requestRequirements', []))
    );
  }

  update(id: string, data: any): Observable<ApiResponse<RequestRequirements>> {
    return this.http.put<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.requestRequirements.update + id, data)
    .pipe(
      tap(_ => this.log('requestRequirements')),
      catchError(this.handleError('requestRequirements', []))
    );
  }

  delete(id: string): Observable<ApiResponse<RequestRequirements>> {
    return this.http.delete<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.requestRequirements.delete + id)
    .pipe(
      tap(_ => this.log('requestRequirements')),
      catchError(this.handleError('requestRequirements', []))
    );
  }

  handleError<T>(operation: string, result?: T) {
    return (error: any): Observable<T> => {
      this.log(`${operation} failed: ${Array.isArray(error.error.message) ? error.error.message[0] : error.error.message}`);
      return of(error.error as T);
    };
  }
  log(message: string) {
    console.log(message);
  }
}
