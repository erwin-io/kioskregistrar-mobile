import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../model/api-response.model';
import { AppConfigService } from './app-config.service';
import { IServices } from './interface/iservices';
import { Admin } from '../model/admin';
import { Member } from '../model/member';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService implements IServices {

  constructor(private http: HttpClient, private appconfig: AppConfigService) { }

  getAllAdmin(): Observable<ApiResponse<Admin[]>> {
    return this.http.get<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.user.getAllAdmin)
    .pipe(
      tap(_ => this.log('user')),
      catchError(this.handleError('user', []))
    );
  }

  getAdminByAdvanceSearch(params: {
    order: any;
    columnDef: { apiNotation: string; filter: string }[];
    pageSize: number;
    pageIndex: number;
  }): Observable<ApiResponse<{ results: Admin[]; total: number}>> {
    return this.http.post<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.user.getAdminByAdvanceSearch,
      params)
    .pipe(
      tap(_ => this.log('user')),
      catchError(this.handleError('user', []))
    );
  }

  getMemberByAdvanceSearch(params: {
    order: any;
    columnDef: { apiNotation: string; filter: string }[];
    pageSize: number;
    pageIndex: number;
  },verified: boolean): Observable<ApiResponse<{ results: Member[]; total: number}>> {
    // eslint-disable-next-line max-len
    return this.http.post<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.user.getMemberByAdvanceSearch + (verified ? 'verified' : 'un-verified'),
      params)
    .pipe(
      tap(_ => this.log('user')),
      catchError(this.handleError('user', []))
    );
  }

  getAdminById(userId: string): Observable<ApiResponse<Admin>> {
    return this.http.get<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.user.getAdminById + userId + '/details')
    .pipe(
      tap(_ => this.log('user')),
      catchError(this.handleError('user', []))
    );
  }

  getMemberById(userId: string): Observable<ApiResponse<Member>> {
    return this.http.get<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.user.getMemberById + userId + '/details')
    .pipe(
      tap(_ => this.log('user')),
      catchError(this.handleError('user', []))
    );
  }

  createAdmin(data: any): Observable<ApiResponse<Admin>> {
    return this.http.post<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.user.createAdmin, data)
    .pipe(
      tap(_ => this.log('user')),
      catchError(this.handleError('user', []))
    );
  }

  updateAdmin(id: string, data: any): Observable<ApiResponse<Admin>> {
    return this.http.put<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.user.updateAdmin + id, data)
    .pipe(
      tap(_ => this.log('user')),
      catchError(this.handleError('user', []))
    );
  }

  updateMember(id: string, data: any): Observable<ApiResponse<Member>> {
    return this.http.put<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.user.updateMember + id, data)
    .pipe(
      tap(_ => this.log('user')),
      catchError(this.handleError('user', []))
    );
  }

  toggleGrantAccess(data: any): Observable<ApiResponse<Admin>> {
    return this.http.put<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.user.toggleGrantAccess, data)
    .pipe(
      tap(_ => this.log('user')),
      catchError(this.handleError('user', []))
    );
  }

  resetMemberPassword(memberCode: string, data: any): Observable<ApiResponse<Member>> {
    return this.http.put<any>(environment.apiBaseUrl +
      this.appconfig.config.apiEndPoints.user.resetMemberPassword + memberCode + '/resetPassword', data)
    .pipe(
      tap(_ => this.log('user')),
      catchError(this.handleError('user', []))
    );
  }

  approveMember(data: any): Observable<ApiResponse<Admin>> {
    return this.http.post<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.user.approveMember, data)
    .pipe(
      tap(_ => this.log('user')),
      catchError(this.handleError('user', []))
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
