/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable max-len */
import { Component, OnInit, Optional } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { App } from '@capacitor/app';
import { LocalNotifications } from '@capacitor/local-notifications';
import { ActionSheetController, AlertController, IonRouterOutlet, ModalController, Platform } from '@ionic/angular';
import { AuthService } from './services/auth.service';
import { Capacitor } from '@capacitor/core';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { StatusBar, Style } from '@capacitor/status-bar';
import { environment } from 'src/environments/environment';
import { StorageService } from './shared/storage/storage.service';
import { LocalNotificationsService } from './services/local-notifications.service';
import { OneSignalNotificationService } from './services/one-signal-notification.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(
    private platform: Platform,
    private alertController: AlertController,
    private authService: AuthService,
    private route: ActivatedRoute,
    private storageService: StorageService,
    private oneSignalNotificationService: OneSignalNotificationService,
    private androidPermissions: AndroidPermissions,
    private localNotificationsService: LocalNotificationsService,
    private modalCtrl: ModalController,
    private actionSheetController: ActionSheetController,
    @Optional() private routerOutlet?: IonRouterOutlet
  ) {
    StatusBar.setOverlaysWebView({ overlay: false });
    StatusBar.setStyle({ style: Style.Light });
    StatusBar.show();


    this.platform.backButton.subscribeWithPriority(10, async () => {
      const modal = await this.modalCtrl.getTop();
      const activeSheet = await this.actionSheetController.getTop();
      if (modal) {
          modal.dismiss();
      } else if(activeSheet) {
        activeSheet.dismiss();
      }else {
        const actionSheet = await this.actionSheetController.create({
          buttons: [
            {
              text: 'Minimize the app?',
              handler: async () => {
                App.minimizeApp();
                actionSheet.dismiss();
              },
            },
            {
              text: 'Close the app?',
              handler: async () => {
                App.exitApp();
                actionSheet.dismiss();
              },
            },
            {
              text: 'Cancel',
              handler: async () => {
                actionSheet.dismiss();
              },
            },
          ],
        });
        await actionSheet.present();
      }
    });
  }
  ngOnInit() {
    this.platform.ready().then(async () => {
      if (Capacitor.platform !== 'web') {
        await this.localNotificationsService.init();
        await this.oneSignalNotificationService.registerOneSignal();
      }
    });
  }


  async presentAlert(options: any) {
    const alert = await this.alertController.create(options);
    await alert.present();
  }
}
