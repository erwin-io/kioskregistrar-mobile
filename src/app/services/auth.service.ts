import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';

import { catchError, tap } from 'rxjs/operators';
import { IServices } from './interface/iservices';
import { AppConfigService } from './app-config.service';
import { Router } from '@angular/router';
import { ApiResponse } from '../model/api-response.model';
import { Users } from '../model/users';
import { Member } from '../model/member';
import { StorageService } from '../shared/storage/storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements IServices {

  isLoggedIn = false;
  redirectUrl: string;

  constructor(
    private http: HttpClient,
    private router: Router,
    private storageService: StorageService,
    private appconfig: AppConfigService) { }

  login(data: any): Observable<ApiResponse<Member>> {
    return this.http.post<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.auth.login.member, data)
    .pipe(
      tap(_ => this.isLoggedIn = true),
      catchError(this.handleError('login', []))
    );
  }

  logOut() {
    const currentUser = this.storageService.getLoginUser();
    if(currentUser) {
      // this.fcmService.delete();
      // this.userService.updateFirebaseToken({
      //   userId: currentUser.userId,
      //   firebaseToken: ''
      // });
    }
    this.storageService.saveAccessToken(null);
    this.storageService.saveRefreshToken(null);
    this.storageService.saveLoginUser(null);
    // this.storageService.saveSessionExpiredDate(null);
    this.storageService.saveTotalUnreadNotif(0);
    window.location.href = 'login';
  }

  register(data: any): Observable<ApiResponse<Users>> {
    return this.http.post<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.auth.registerMember, data)
    .pipe(
      tap(_ => this.log('register')),
      catchError(this.handleError('register', []))
    );
  }

  redirectToPage(profile: Member, auth: boolean) {
    this.router.navigate([auth ? 'auth/member' : 'member'], { replaceUrl: true });
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
