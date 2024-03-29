import { Injectable } from '@angular/core';
import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
  PushNotification,
  PushNotificationActionPerformed,
  PushNotificationToken,
} from '@capacitor/push-notifications';
import { FCM } from '@capacitor-community/fcm';
import { UserService } from './user.service';
import { Capacitor } from '@capacitor/core';
import { Member } from '../model/member';
import { StorageService } from '../shared/storage/storage.service';
@Injectable({
  providedIn: 'root'
})
export class FcmService {
  topic = 'announcements';
  currentUser: Member;
  constructor(
    private storageService: StorageService,
    private userService: UserService) {
      this.currentUser = this.storageService.getLoginUser();
    }

  init() {
    if (Capacitor.platform !== 'web') {
      this.delete();
      PushNotifications.createChannel({
       id: 'fcm_default_channel',
       name: 'NORSU Registrar KIOSK',
       importance: 5,
       visibility: 1,
       lights: true,
       vibration: true,
       sound: 'notif_alert'
     });
     this.registerPushNotif();
    }
  }

  registerPushNotif() {
    this.currentUser = this.storageService.getLoginUser();

    PushNotifications.requestPermissions().then((permission) => {
      PushNotifications.register();
      if (permission.receive) {
        // Register with Apple / Google to receive push via APNS/FCM
      } else {
        // No permission for push granted
      }
    });


    // now you can subscribe to a specific topic
    FCM.subscribeTo({ topic: this.topic })
      .then((r) => console.log(`subscribed to topic`))
      .catch((err) => {console.log('error subscribing to topic');console.log(err);});

    PushNotifications.addListener(
      'registration',
      (token: PushNotificationToken) => {
        // this.userService.updateFirebaseToken({
        //   userId: this.currentUser.userId,
        //   firebaseToken: token.value
        // }).subscribe((res)=> {
        // }, (err)=>{console.log('error saving token');console.log(err);});
      }
    );

    PushNotifications.addListener('registrationError', (error: any) => {
      console.log('Error: ' + JSON.stringify(error));
    });

    PushNotifications.addListener(
      'pushNotificationReceived',
      async (notification: PushNotification) => {
        console.log('Push received: ' + JSON.stringify(notification));
      }
    );

    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      async (notification: PushNotificationActionPerformed) => {
        const data = notification.notification.data;
        console.log('Action performed: ' + JSON.stringify(notification.notification));
        if (data.detailsId) {
          // this.router.navigateByUrl(`/home/${data.detailsId}`);
        }
      }
    );
  }


  delete() {
    if (Capacitor.platform !== 'web') {

      // Remove FCM instance
      FCM.deleteInstance()
        .then(() => console.log(`Token deleted`))
        .catch((err) => {console.log('error deleting instance token');console.log(err);});

      // Unsubscribe from a specific topic
      FCM.unsubscribeFrom({ topic: this.topic })
      .then(() => console.log(`unsubscribed from topic`))
      .catch((err) => {console.log('error unsubscribing topic');console.log(err);});
    }
  }


}
