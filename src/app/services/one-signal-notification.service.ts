/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable max-len */
import { Injectable } from '@angular/core';
import OneSignalPlugin from 'onesignal-cordova-plugin';
import { environment } from 'src/environments/environment';
import { UserOneSignalSubscriptionService } from './user-one-signal-subscription.service';
import { AuthService } from './auth.service';
import { ModalController } from '@ionic/angular';
import { AnimationService } from './animation.service';
import { forkJoin } from 'rxjs';
import { NotificationService } from './notification.service';
import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
  PushNotification,
  PushNotificationActionPerformed,
  PushNotificationToken,
} from '@capacitor/push-notifications';
import { StorageService } from '../shared/storage/storage.service';
import { PageLoaderService } from '../shared/ui-service/page-loader.service';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root'
})
export class OneSignalNotificationService {

  constructor(
    private storageService: StorageService,
    private pageLoaderService: PageLoaderService,
    private modalCtrl: ModalController,
    private notificationService: NotificationService,
    private animationService: AnimationService,
    private router: Router,
    private authService: AuthService,
    private userOneSignalSubscriptionService: UserOneSignalSubscriptionService) { }


  get isAuthenticated() {
    const currentUser = this.storageService.getLoginUser();
    return currentUser &&
    currentUser.memberId &&
    currentUser.user &&
    currentUser.memberId !== '' &&
    currentUser.user?.userId;
  }

  async registerOneSignal() {
    console.log('calling setAppId');
    PushNotifications.createChannel({
     id: 'fcm_default_channel',
     name: 'ZamsConnect',
     importance: 5,
     visibility: 1,
     lights: true,
     vibration: true,
     sound: 'notif_alert'
   });
    OneSignalPlugin.setAppId(environment.oneSignalAppId);
    OneSignalPlugin.disablePush(true);
    OneSignalPlugin.disablePush(false);
    OneSignalPlugin.promptForPushNotificationsWithUserResponse(true);
    OneSignalPlugin.getDeviceState(res=> {
      console.log('getDeviceState ', JSON.stringify(res));
      this.addCredentials();
    });
    this.addCredentials();
    console.log('calling addSubscriptionObserver');
    OneSignalPlugin.addSubscriptionObserver(res=> {
      console.log('Subscription id ', res?.to?.userId);

      this.storageService.saveOneSignalSubscriptionId(res?.to?.userId);
      if(this.isAuthenticated) {
        this.addCredentials();
        const currentUser = this.storageService.getLoginUser();
        this.userOneSignalSubscriptionService.create({
          userId: currentUser?.user?.userId,
          subscriptionId: res?.to?.userId
        }).subscribe((res)=> {
          console.log('subscription saved');
        }, (err)=>{console.log('error saving subscription');console.log(err);});
      }
    });
    console.log('calling addPermissionObserver');
    OneSignalPlugin.addPermissionObserver(res=> {
      console.log('addPermissionObserver result', JSON.stringify(res));
    });

    OneSignalPlugin.setNotificationOpenedHandler(async res=> {
      console.log('setNotificationOpenedHandler result', JSON.stringify(res));
      console.log('received data from api : ' + JSON.stringify(res?.notification?.additionalData));
      const { type, referenceId } = res?.notification?.additionalData as any;
      this.router.navigate(['/notifications'], { replaceUrl: true });
    });

    OneSignalPlugin.setNotificationWillShowInForegroundHandler(res=> {
      console.log('Nofication received data ', JSON.stringify(res.getNotification().additionalData));
      const { notificationIds, inAppData } = res.getNotification().additionalData as any;
      if(notificationIds) {
        this.storageService.saveReceivedNotification(notificationIds);
      }
      if(inAppData) {
        // OneSignalPlugin.removeTriggerForKey('in_app_type');
        const { name } = inAppData;
        OneSignalPlugin.addTrigger('in_app_type', name);
      }
    });
  }

  async addCredentials() {
    if(this.isAuthenticated) {
      const currentUser = this.storageService.getLoginUser();
      console.log('OneSignalPlugin.setExternalUserId ', currentUser?.user?.userName);
      OneSignalPlugin.setExternalUserId(currentUser?.user?.userName);
    }
  }
}
