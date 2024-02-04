/* eslint-disable max-len */
import { Injectable } from '@angular/core';
import { IServices } from './interface/iservices';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../model/api-response.model';
import { Request } from '../model/request';
import { AppConfigService } from './app-config.service';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RequestService implements IServices {

  constructor(private http: HttpClient, private appconfig: AppConfigService) { }

  getByAdvanceSearch(params: {
    order: any;
    columnDef: { apiNotation: string; filter: any; type?: string }[];
    pageSize: number;
    pageIndex: number;
  }): Observable<ApiResponse<{ results: Request[]; total: number}>> {
    return this.http.post<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.request.getByAdvanceSearch,
      params)
    .pipe(
      tap(_ => this.log('request')),
      catchError(this.handleError('request', []))
    );
  }

  getById(requestNo: string): Observable<ApiResponse<Request>> {
    return this.http.get<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.request.getById + requestNo)
    .pipe(
      tap(_ => this.log('request')),
      catchError(this.handleError('request', []))
    );
  }

  create(params: any): Observable<ApiResponse<Request>> {
    return this.http.post<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.request.create,
      params)
    .pipe(
      tap(_ => this.log('request')),
      catchError(this.handleError('request', []))
    );
  }

  update(requestNo: string, params: any): Observable<ApiResponse<Request>> {
    return this.http.put<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.request.update + requestNo,
      params)
    .pipe(
      tap(_ => this.log('request')),
      catchError(this.handleError('request', []))
    );
  }

  updateDescription(requestNo: string, params: any): Observable<ApiResponse<Request>> {
    return this.http.put<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.request.updateDescription + requestNo + '/updateDescription',
      params)
    .pipe(
      tap(_ => this.log('request')),
      catchError(this.handleError('request', []))
    );
  }

  completeRequest(requestNo: string, params: any): Observable<ApiResponse<Request>> {
    return this.http.put<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.request.updateStatus + requestNo + '/completeRequest',
      params)
    .pipe(
      tap(_ => this.log('request')),
      catchError(this.handleError('request', []))
    );
  }

  cancelRequest(requestNo: string, params: any): Observable<ApiResponse<Request>> {
    return this.http.put<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.request.updateStatus + requestNo + '/cancelRequest',
      params)
    .pipe(
      tap(_ => this.log('request')),
      catchError(this.handleError('request', []))
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
