import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { Platform } from '@ionic/angular';
import { OneSignalNotificationService } from 'src/app/services/one-signal-notification.service';
import { StorageService } from 'src/app/shared/storage/storage.service';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.page.html',
  styleUrls: ['./landing-page.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LandingPagePage implements OnInit {
  isLoading = false;
  constructor(
    private router: Router,
    private platform: Platform,
    private oneSignalNotificationService: OneSignalNotificationService,
    private storageService: StorageService) {
    const user = this.storageService.getLoginUser();

    if (user) {
      // window.location.href = 'home';
      this.router.navigate(['/home'], { replaceUrl: true });
    } else {
      const hasPrevUser = localStorage.getItem('hasPrevUser');
      if(hasPrevUser === 'true') {
        this.router.navigate(['/signup'], { replaceUrl: true });
      }
    }
   }

  async ngOnInit() {
    localStorage.removeItem('register-draft');
    this.platform.ready().then(async () => {
      if (Capacitor.platform !== 'web') {
        await this.oneSignalNotificationService.registerOneSignal();
      }
    });
    if(window.history.state && window.history.state.data && window.history.state.data.register){
      window.history.state.data = null;
      this.router.navigate(['/signup'], { replaceUrl: true });
    } else if(window.history.state.data && window.history.state.data.login) {
      window.history.state.data = null;
      this.router.navigate(['/signup'], { replaceUrl: true });
    }
    setTimeout(()=> {
      this.isLoading = false;
    }, 1000);
  }

  onGetStarted() {
    this.router.navigate(['/signup'], { replaceUrl: true });
  }

}
