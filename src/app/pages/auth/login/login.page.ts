import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Member } from 'src/app/model/member';
import { AppConfigService } from 'src/app/services/app-config.service';
import { AuthService } from 'src/app/services/auth.service';
import { FcmService } from 'src/app/services/fcm.service';
import { UserOneSignalSubscriptionService } from 'src/app/services/user-one-signal-subscription.service';
import { UserService } from 'src/app/services/user.service';
import { StorageService } from 'src/app/shared/storage/storage.service';
import { LoaderService } from 'src/app/shared/ui-service/loader.service';
import { PageLoaderService } from 'src/app/shared/ui-service/page-loader.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LoginPage implements OnInit {
  isSubmitting = false;
  loginForm: FormGroup;
  // sessionTimeout;
  enableBackToHome = false;
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private userService: UserService,
    private alertController: AlertController,
    private storageService: StorageService,
    private loaderService: LoaderService,
    private appconfig: AppConfigService,
    private fcmService: FcmService,
    private userOneSignalSubscriptionService: UserOneSignalSubscriptionService,
    private pageLoaderService: PageLoaderService
  ) {
    // this.sessionTimeout = Number(
    //   this.appconfig.config.sessionConfig.sessionTimeout
    // );
  }
  get formData() {
    return this.loginForm.value;
  }

  async ngOnInit() {
    this.loginForm = this.formBuilder.group({
      userName: [null, Validators.required],
      password: [null, Validators.required],
      rememberMe: [false],
    });
  }

  async onFormSubmit() {
    if (!this.loginForm.valid) {
      return;
    }
    this.loginForm.disable();
    try {
      const params = this.formData;
      this.isSubmitting = true;
      await this.pageLoaderService.open('Signing in please wait...');
      const res = await this.authService.login(params).toPromise();
      if (res.success) {
        // this.storageService.saveRefreshToken(res.data.accessToken);
        // this.storageService.saveAccessToken(res.data.refreshToken);
        // this.storageService.saveTotalUnreadNotif(res.data.totalUnreadNotif);
        const userData: Member = res.data;
        this.storageService.saveLoginUser(userData);
        // this.fcmService.init();
        // this.router.navigate(['/'], { replaceUrl: true });
        // this.isSubmitting = false;
        const subscriptionId = this.storageService.getOneSignalSubscriptionId();
        if(subscriptionId && subscriptionId !== '' && subscriptionId !== null && !subscriptionId?.toString().includes('null')) {
          await this.userOneSignalSubscriptionService.create({
            userId: res.data.user?.userId,
            subscriptionId
          }).toPromise().catch(async (firebaseRes: any)=> {
            this.loginForm.enable();
            await this.pageLoaderService.close();
            this.isSubmitting = false;
            await this.presentAlert({
              header: 'Try again!',
              message: Array.isArray(res.message) ? res.message[0] : res.message,
              buttons: ['OK']
            });
          }).finally(() => {
            setTimeout(async ()=> {
              this.isSubmitting = false;
              window.location.href = '/';
            }, 2000);
          });
        } else {
          setTimeout(async ()=> {
            this.isSubmitting = false;
            window.location.href = '/';
          }, 2000);
        }
      } else {
        this.loginForm.enable();
        this.isSubmitting = false;
        await this.pageLoaderService.close();
        await this.presentAlert({
          header: 'Try again!',
          message: Array.isArray(res.message) ? res.message[0] : res.message,
          buttons: ['Ok'],
        });
      }
    } catch (e) {
      this.loginForm.enable();
      await this.pageLoaderService.close();
      this.isSubmitting = false;
      await this.presentAlert({
        header: 'Try again!',
        subHeader: '',
        message: Array.isArray(e.message) ? e.message[0] : e.message,
        buttons: ['Ok'],
      });
    }
  }

  async presentAlert(options: any) {
    const alert = await this.alertController.create(options);
    await alert.present();
  }
}
