/* eslint-disable max-len */
/* eslint-disable prefer-const */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/member-ordering */
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActionSheetController, AlertController, ModalController, NavController, Platform } from '@ionic/angular';
import {map} from 'rxjs/operators';
import { forkJoin, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { SuperTabs } from '@ionic-super-tabs/angular';
import { AuthService } from 'src/app/services/auth.service';
import { StorageService } from 'src/app/shared/storage/storage.service';
import { Member } from 'src/app/model/member';
import { Location } from '@angular/common';
import { AnimationService } from 'src/app/services/animation.service';
import { Request } from 'src/app/model/request';
import { PageLoaderService } from 'src/app/shared/ui-service/page-loader.service';
import { RequestService } from 'src/app/services/request.service';
import { PusherService } from 'src/app/services/pusher.service';
import { RequestDetailsPage } from '../request-details/request-details.page';

@Component({
  selector: 'app-request-history',
  templateUrl: './request-history.page.html',
  styleUrls: ['./request-history.page.scss'],
})
export class RequestHistoryPage implements OnInit, AfterViewInit {
  selectedStatus: string[] = ['Pending', 'Approved'];
  currentUser: Member;
  isLoading = false;
  message = '';
  refreshEvent: any;
  subscription: Subscription;
  requestData: Request[] = [];
  pageIndex = 0;
  pageSize = 10;
  total = 0;
  filter: {
    apiNotation: string;
    filter: string;
    name: string;
    type: string;
  }[] = [];

  isOpenRequestResultModal = false;
  requestResultModal: { type: 'success' | 'failed' | 'warning'; title: string; desc: string; done?; retry? };
  constructor(private actionSheetController: ActionSheetController,
    private modalCtrl: ModalController,
    private requestService: RequestService,
    private alertController: AlertController,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private storageService: StorageService,
    private cd: ChangeDetectorRef,
    private pageLoaderService: PageLoaderService,
    private animationService: AnimationService,
    public platform: Platform,
    private pusherService: PusherService) {
      this.currentUser = this.storageService.getLoginUser();
  }

  get isAuthenticated() {
    const currentUser = this.storageService.getLoginUser();
    return currentUser &&
    currentUser.memberId &&
    currentUser.user &&
    currentUser.memberId !== '' &&
    currentUser.user?.userId;
  }

  async ngOnInit() {
    const channelUser = this.pusherService.init(this.currentUser.user.userId);
    channelUser.bind('requestChanges', async (res: Request) => {
      console.log('requestChanges', res);
      this.pageIndex = 0;
      this.pageSize = 10;
      await this.initRequest(this.currentUser.memberId, true);
    });
  }

  async ngAfterViewInit() {
    if(this.isAuthenticated) {
      try {
        this.initRequest(this.currentUser?.memberId, true);
      }catch(ex) {
        await this.presentAlert({
          header: 'Try again!',
          message: 'Error loading reseravation',
          buttons: ['OK']
        });
      }
    }
  }

  async ionViewWillEnter(){

    this.cd.detectChanges();
  }

  ionViewDidEnter() {
    this.subscription = this.platform.backButton.subscribeWithPriority(9999, () => {
      document.addEventListener('backbutton', (event) => {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
      }, false);
    });
  }

  ionViewWillLeave() {
    this.subscription.unsubscribe();
  }

  segmentChanged(ev: any) {
  }

  async onOpenAdd() {
    this.cd.detectChanges();
    if(!this.isAuthenticated) {
      this.authService.logOut();
    }
    let modal: HTMLIonModalElement;
    modal = await this.modalCtrl.create({
      component: RequestDetailsPage,
      cssClass: 'modal-fullscreen',
      backdropDismiss: false,
      canDismiss: true,
      enterAnimation: this.animationService.flyUpAnimation,
      leaveAnimation: this.animationService.leaveFlyUpAnimation,
      componentProps: { modal, isNew: true },
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm') {
      this.pageIndex = 0;
      this.pageSize = 10;
      await this.initRequest(this.currentUser.memberId, true);
    }

  }

  async loadMore() {
    this.pageIndex = this.pageIndex + 1;
    await this.initRequest(this.currentUser.memberId);
  }

  async doRefresh(event = null){
    try {
      this.pageIndex = 0;
      this.pageSize = 10;
      this.requestData = [];
      await this.initRequest(this.currentUser.memberId, true).finally(()=> {

        if(event) {
          this.refreshEvent = event;
          this.refreshEvent.target.complete();
          this.refreshEvent = null;
        }
      });
    }catch(ex) {
      await this.presentAlert({
        header: 'Try again!',
        message: 'Error loading reseravation',
        buttons: ['OK']
      });
    }
  }

  public async initRequest(memberId: string, showProgress = false) {
    try{
      this.isLoading = showProgress;
      this.requestService.getByAdvanceSearch({
        order: {
          dateLastUpdated: 'DESC'
        },
        columnDef: [{
          apiNotation: 'requestedBy.memberId',
          filter: memberId,
          type: 'precise'
        },{
          apiNotation: 'requestStatus',
          filter: ['CLOSED','CANCEL','REJECTED', 'TOCOMPLETE'],
          type: 'in'
        }
      ],
        pageIndex: this.pageIndex,
        pageSize: this.pageSize
      })
      .subscribe(async res => {
        if(res.success){
          this.requestData = [...this.requestData, ...res.data.results];
          this.total = res.data.total;
          this.isLoading = false;
        }
        else{
          await this.presentAlert({
            header: 'Try again!',
            subHeader: '',
            message: Array.isArray(res.message) ? res.message[0] : res.message,
            buttons: ['OK']
          });
        }
      }, async (e) => {
        await this.presentAlert({
          header: 'Try again!',
          subHeader: '',
          message: Array.isArray(e.message) ? e.message[0] : e.message,
          buttons: ['OK']
        });
        this.isLoading = false;
      });
    }
    catch(e){
      await this.presentAlert({
        header: 'Try again!',
        subHeader: '',
        message: Array.isArray(e.message) ? e.message[0] : e.message,
        buttons: ['OK']
      });
    }
  }

  async showMenu(details){
    const actionSheet = await this.actionSheetController.create({
      cssClass: 'sched-card-action-sheet',
      buttons: [{
          text: 'Details',
          handler:async () => {
            this.onOpenDetails(details);
            await actionSheet.dismiss();
          }
        },
        {
          text: 'Back',
          handler:async () => {
            await actionSheet.dismiss();
          }
        }
      ]
    });
    await actionSheet.present();

    const result = await actionSheet.onDidDismiss();
  }

  async onOpenDetails(details: Request) {
    const modal = await this.modalCtrl.create({
      component: RequestDetailsPage,
      cssClass: 'modal-fullscreen',
      componentProps: { details, currentUser: this.currentUser },
    });
    modal.present();
    await modal.onWillDismiss().then(async (res) => {
      if(res.role === 'confirm') {
        this.pageIndex = 0;
        this.pageSize = 10;
        await this.initRequest(this.currentUser.memberId, true);
      }
    });
  }

  close() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  async presentAlert(options: any) {
    const alert = await this.alertController.create({

    });
    await alert.present();
  }
}
