/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

import { map, catchError, filter, switchMap, take, tap } from 'rxjs/operators';
import { AppConfigService } from '../services/app-config.service';
import { StorageService } from '../shared/storage/storage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  // sessionTimeout;
  constructor(
    private authService: AuthService,
    private router: Router,
    private storageService: StorageService,
    private appconfig: AppConfigService
  ) {
    // this.sessionTimeout = Number(this.appconfig.config.sessionConfig.sessionTimeout);
  }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
      let canActivate = false;
    const profile = this.storageService.getLoginUser();
    if(!profile) {
      this.router.navigate(['/landing-page'], { replaceUrl: true });
      return false;
    }
    if(profile.user && profile.user.userId) {
      canActivate = true;
    }
    return canActivate;
  }
}
