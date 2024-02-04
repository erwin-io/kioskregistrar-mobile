import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, filter, switchMap, take, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { environment } from 'src/environments/environment.prod';
import { StorageService } from '../shared/storage/storage.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor() { }

 intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {


     return next.handle(req)
          .pipe(tap((event: HttpEvent<any>) => {
                 if (event instanceof HttpResponse) {
                 }
             }, (error) => {
             }));
 }
}
