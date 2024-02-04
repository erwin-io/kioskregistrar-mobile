import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../model/api-response.model';
import { Courses } from '../model/courses.model';
import { AppConfigService } from './app-config.service';
import { IServices } from './interface/iservices';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CoursesService implements IServices {

  constructor(private http: HttpClient, private appconfig: AppConfigService) { }

  getAll(): Observable<ApiResponse<Courses[]>> {
    return this.http.get<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.courses.getAll)
    .pipe(
      tap(_ => this.log('course')),
      catchError(this.handleError('course', []))
    );
  }

  getById(courseId: string): Observable<ApiResponse<Courses>> {
    return this.http.get<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.courses.getById + courseId)
    .pipe(
      tap(_ => this.log('course')),
      catchError(this.handleError('course', []))
    );
  }

  create(data: any): Observable<ApiResponse<Courses>> {
    return this.http.post<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.courses.create, data)
    .pipe(
      tap(_ => this.log('course')),
      catchError(this.handleError('course', []))
    );
  }

  update(id: string, data: any): Observable<ApiResponse<Courses>> {
    return this.http.put<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.courses.update + id, data)
    .pipe(
      tap(_ => this.log('course')),
      catchError(this.handleError('course', []))
    );
  }

  delete(id: string): Observable<ApiResponse<Courses>> {
    return this.http.delete<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.courses.delete + id)
    .pipe(
      tap(_ => this.log('course')),
      catchError(this.handleError('course', []))
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
