import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../model/api-response.model';
import { AppConfigService } from './app-config.service';
import { IServices } from './interface/iservices';
import { catchError, tap } from 'rxjs/operators';
import { RequestType } from '../model/request-type';

@Injectable({
  providedIn: 'root'
})
export class RequestTypeService implements IServices {

  constructor(private http: HttpClient, private appconfig: AppConfigService) { }

  getByAdvanceSearch(params: {
    order: any;
    columnDef: { apiNotation: string; filter: string }[];
    pageSize: number;
    pageIndex: number;
  }): Observable<ApiResponse<{ results: RequestType[]; total: number}>> {
    return this.http.post<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.requestType.getByAdvanceSearch,
      params)
    .pipe(
      tap(_ => this.log('requestType')),
      catchError(this.handleError('requestType', []))
    );
  }

  getById(requestTypeId: string): Observable<ApiResponse<RequestType>> {
    return this.http.get<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.requestType.getById + requestTypeId)
    .pipe(
      tap(_ => this.log('requestType')),
      catchError(this.handleError('requestType', []))
    );
  }

  create(data: any): Observable<ApiResponse<RequestType>> {
    return this.http.post<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.requestType.create, data)
    .pipe(
      tap(_ => this.log('requestType')),
      catchError(this.handleError('requestType', []))
    );
  }

  update(id: string, data: any): Observable<ApiResponse<RequestType>> {
    return this.http.put<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.requestType.update + id, data)
    .pipe(
      tap(_ => this.log('requestType')),
      catchError(this.handleError('requestType', []))
    );
  }

  delete(id: string): Observable<ApiResponse<RequestType>> {
    return this.http.delete<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.requestType.delete + id)
    .pipe(
      tap(_ => this.log('requestType')),
      catchError(this.handleError('requestType', []))
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
