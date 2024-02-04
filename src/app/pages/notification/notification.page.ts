/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { AfterViewInit, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, AlertController, ActionSheetController, IonModal, IonRefresher } from '@ionic/angular';
// import { StorageService } from 'src/app/core/storage/storage.service';
// import { PageLoaderService } from 'src/app/core/ui-service/page-loader.service';

// English.
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import { forkJoin } from 'rxjs';
import * as moment from 'moment';
import { Request } from 'src/app/model/request';
import { Member } from 'src/app/model/member';
import { StorageService } from 'src/app/shared/storage/storage.service';
import { PageLoaderService } from 'src/app/shared/ui-service/page-loader.service';
import { Notifications } from 'src/app/model/notifications';
import { AnimationService } from 'src/app/services/animation.service';
import { AuthService } from 'src/app/services/auth.service';
import { NotificationService } from 'src/app/services/notification.service';
import { PusherService } from 'src/app/services/pusher.service';
import { RequestService } from 'src/app/services/request.service';
import { RequestDetailsPage } from '../request/request-details/request-details.page';
// import { BookingDetailsPage } from '../booking/booking-details/booking-details.page';

export class NotificationsView extends Notifications {
  icon: 'notifications' | 'calendar' | 'chatbubbles';
  iconColor: 'primary' | 'secondary' | 'warning' | 'danger' | 'tertiary';
}

@Component({
  selector: 'app-notification',
  templateUrl: './notification.page.html',
  styleUrls: ['./notification.page.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class NotificationPage implements OnInit, AfterViewInit {
  currentProfile: Member;
  data: NotificationsView[] = [];
  pageIndex = 0;
  pageSize = 10;
  total = 0;
  isLoading = false;
  error: any;
  limit = 10;
  totalItems = 0;
  totalUnreadNotification = 0;
  @ViewChild(IonRefresher)ionRefresher: IonRefresher;
  constructor(
    private modalCtrl: ModalController,
    private router: Router,
    private pageLoaderService: PageLoaderService,
    private alertController: AlertController,
    private requestService: RequestService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private animationService: AnimationService,
    private storageService: StorageService,
    private actionSheetCtrl: ActionSheetController,
    private pusherService: PusherService) {
      this.currentProfile = this.storageService.getLoginUser();
      this.initNotification(this.currentProfile.user?.userId, true);
      // TimeAgo.addDefaultLocale(en);
    }

  ngOnInit() {
    const channel = this.pusherService.init(this.currentProfile.user.userId);
    channel.bind('notifAdded', (res: any) => {
      this.doRefresh();
    });
  }

  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
    // this.studentTimeInfoModal.present();
  }

  get isAuthenticated() {
    return this.currentProfile &&
    this.currentProfile?.memberId &&
    this.currentProfile?.user?.userId;
  }

  async initNotification(userId: string, showProgress = false){
    this.isLoading = showProgress;
    try {
      const [notif, counts] = await forkJoin([
        this.notificationService.getByAdvanceSearch({
          order: { notificationId: 'DESC' },
          columnDef: [{
            apiNotation: 'user.userId',
            filter: userId,
            type: 'precise'
          } as any],
          pageIndex: this.pageIndex,
          pageSize: this.pageSize
        }),
        this.notificationService.getUnreadByUser(userId),
      ]).toPromise();
      if(notif.success && counts.success) {
        // do things
        const newNotif = notif.data.results.map(x=> {
          const n = x as NotificationsView;
          if(n.type === 'REQUEST') {
            n.icon = 'calendar';
            n.iconColor = 'primary';
          } else if(n.type === 'SUPPORT') {
            n.icon = 'chatbubbles';
            n.iconColor = 'danger';
          } else {
            n.icon = 'notifications';
            n.iconColor = 'primary';
          }
          return x as NotificationsView;
        });
        this.data = [ ...this.data, ...newNotif ];
        this.totalItems = notif.data.total;
        this.totalUnreadNotification = counts.data;
        this.storageService.saveTotalUnreadNotif(this.totalUnreadNotification);
        this.isLoading = false;
      } else {
        const message = Array.isArray(notif.message) ? notif.message[0] : notif.message + ', ' + '\n' +
        Array.isArray(counts.message) ? counts.message[0] : counts.message;
        await this.presentAlert({
          header: 'Try again!',
          message,
          buttons: ['OK']
        });
        this.isLoading = false;
      }
      if(this.ionRefresher) {
        this.ionRefresher.complete();
      }
    } catch (e){
      await this.presentAlert({
        header: 'Try again!',
        message: Array.isArray(e.message) ? e.message[0] : e.message,
        buttons: ['OK']
      });
    }
  }

  async getTimeAgo(date: Date) {
    if(!this.isLoading) {
      const timeAgo = new TimeAgo('en-US');
      return timeAgo.format(date);
    } else {
      return null;
    }
  }
  async onNotificationClick(notif: Notifications) {
    if(!this.isAuthenticated) {
      this.authService.logOut();
    }

    if(notif.type === 'REQUEST') {
      await this.pageLoaderService.open('Loading please wait...');
      const res = await this.requestService.getById(notif.referenceId).toPromise();
      this.pageLoaderService.close();
      if(res?.success) {
        this.onOpenRequestDetails(res?.data).then(()=> {
          if(!this.data.filter(x=>x.notificationId === notif.notificationId)[0].isRead) {
            this.markNotifAsRead(notif);
          }
        });
      } else {
        await this.presentAlert({
          header: 'Try again!',
          message: res.message,
          buttons: ['OK']
        });
      }
    } else if(notif.type === 'SUPPORT') {
    } else {
      await this.presentAlert({
        header: notif.title,
        message: notif.description,
        buttons: ['OK']
      });
    }
  }

  async getTotalUnreadNotif(userId: string){
    try {
      this.isLoading = true;
      this.notificationService.getUnreadByUser(userId).subscribe((res)=> {
        if(res.success){
          console.log(res.data);
          this.totalUnreadNotification = res.data.total;
          this.storageService.saveTotalUnreadNotif(this.totalUnreadNotification);
          this.isLoading = false;
          if(this.ionRefresher) {
            this.ionRefresher.complete();
          }
        } else {
          this.isLoading = false;
          this.error = Array.isArray(res.message)
            ? res.message[0]
            : res.message;
          this.presentAlert(this.error);
        }
      },
      async (err) => {
        this.isLoading = false;
        this.error = Array.isArray(err.message)
          ? err.message[0]
          : err.message;
        this.presentAlert(this.error);
      });
    } catch (e) {
      this.isLoading = false;
      this.error = Array.isArray(e.message) ? e.message[0] : e.message;
      this.presentAlert(this.error);
    }
  }

  async onOpenRequestDetails(details: Request) {
    try {
      const modal = await this.modalCtrl.create({
        component: RequestDetailsPage,
        cssClass: 'modal-fullscreen',
        componentProps: { details, currentUser: this.currentProfile },
      });
      modal.present();
      await modal.onWillDismiss().then(async (res) => {
        if(res.role === 'confirm') {
          this.pageIndex = 0;
          this.pageSize = 10;
          await this.initNotification(this.currentProfile.user?.userId, true);
        }
      });
    } catch(ex) {
      this.isLoading = false;
      await this.presentAlert({
        header: 'Try again!',
        message: 'Error loading reseravation',
        buttons: ['OK']
      });
    }
  }

  async loadMore() {
    this.pageIndex = this.pageIndex + 1;
    await this.initNotification(this.currentProfile.user?.userId);
  }

  async doRefresh(){
    try {
      if(this.isLoading) {
        return;
      }
      this.data = [];
      this.pageIndex = 0;
      this.pageSize = 10;
      await this.initNotification(this.currentProfile.user?.userId, true);
    } catch(ex) {
      if(this.ionRefresher) {
        this.ionRefresher.complete();
      }
    }
 }

  async presentAlert(options: any) {
    const alert = await this.alertController.create(options);
    await alert.present();
  }

  async markNotifAsRead(notifDetails: { notificationId: string }) {
    try{
      this.notificationService.marAsRead(notifDetails.notificationId)
        .subscribe(async res => {
          if (res.success) {
            this.data.filter(x=>x.notificationId === notifDetails.notificationId)[0].isRead = true;
            this.storageService.saveTotalUnreadNotif(res.data.total);
          } else {
            await this.presentAlert({
              header: 'Try again!',
              message: Array.isArray(res.message) ? res.message[0] : res.message,
              buttons: ['OK']
            });
          }
        }, async (err) => {
          await this.presentAlert({
            header: 'Try again!',
            message: Array.isArray(err.message) ? err.message[0] : err.message,
            buttons: ['OK']
          });
        });
    } catch (e){
      await this.presentAlert({
        header: 'Try again!',
        message: Array.isArray(e.message) ? e.message[0] : e.message,
        buttons: ['OK']
      });
    }
  }


  ionViewWillEnter(){
    console.log('visited');
    if(window.history.state && window.history.state.open && window.history.state.open){
      const details = window.history.state.open as any;
      // this.openDetails(details);
    }
  }

  close() {
    this.modalCtrl.dismiss(null, 'cancel');
  }
}
