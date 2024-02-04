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
import { RequestHistoryPage } from './request-history/request-history.page';
import { Location } from '@angular/common';
import { AnimationService } from 'src/app/services/animation.service';
import { RequestDetailsPage } from './request-details/request-details.page';
import { Request } from 'src/app/model/request';
import { PageLoaderService } from 'src/app/shared/ui-service/page-loader.service';
import { RequestService } from 'src/app/services/request.service';
import { PusherService } from 'src/app/services/pusher.service';

@Component({
  selector: 'app-request',
  templateUrl: './request.page.html',
  styleUrls: ['./request.page.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class RequestPage implements OnInit, AfterViewInit {
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
      this.requestData = [];
      await this.initRequest(this.currentUser.memberId, true);
    });
  }

  async ngAfterViewInit() {
    if(this.isAuthenticated) {
      try {
        this.requestData = [];
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
    try {
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
        this.requestData = [];
        await this.initRequest(this.currentUser.memberId, true);
      }
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
      this.isLoading = false;
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
          dateLastUpdated: 'ASC',
          requestId: 'ASC'
        },
        columnDef: [{
          apiNotation: 'requestedBy.memberId',
          filter: memberId,
          type: 'precise'
        },{
          apiNotation: 'requestStatus',
          filter: ['PENDING','TOPAY','PROCESSING','TOCOMPLETE'],
          type: 'in'
        },{
          apiNotation: 'dateCompleted',
          filter: null,
          type: 'null'
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
          this.isLoading = false;
          await this.presentAlert({
            header: 'Try again!',
            subHeader: '',
            message: Array.isArray(res.message) ? res.message[0] : res.message,
            buttons: ['OK']
          });
        }
      }, async (e) => {
        this.isLoading = false;
        await this.presentAlert({
          header: 'Try again!',
          subHeader: '',
          message: Array.isArray(e.message) ? e.message[0] : e.message,
          buttons: ['OK']
        });
      });
    }
    catch(e){
      this.isLoading = false;
      await this.presentAlert({
        header: 'Try again!',
        subHeader: '',
        message: Array.isArray(e.message) ? e.message[0] : e.message,
        buttons: ['OK']
      });
    }
  }

  async onOpenDetails(details: Request) {
    try {
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
          this.requestData = [];
          await this.initRequest(this.currentUser.memberId, true);
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

  async cancelRequest(requestNo){
    try{
      const sheet = await this.actionSheetController.create({
        cssClass: 'app-action-sheet',
        header: `Are you sure you want to cancel request?`,
        buttons: [
          {
            text: 'YES Continue',
            handler: async () => {
              sheet.dismiss();
              await this.pageLoaderService.open('Processing please wait...');
              this.isLoading = true;
              this.requestService.cancelRequest(requestNo, {})
                .subscribe(async res => {
                  if (res.success) {
                    await this.pageLoaderService.close();
                    this.isLoading = false;
                    this.isOpenRequestResultModal = true;
                    this.requestResultModal = {
                      title: 'Success!',
                      desc: 'Request cancelled!',
                      type: 'success',
                      done: async ()=> {
                        this.isOpenRequestResultModal = false;
                        this.pageIndex = 0;
                        this.pageSize = 10;
                        await this.doRefresh();
                      }
                    };
                  } else {
                    await this.pageLoaderService.close();
                    this.isLoading = false;
                    this.isOpenRequestResultModal = true;
                    this.requestResultModal = {
                      title: 'Oops!',
                      desc: res.message,
                      type: 'failed',
                      retry: ()=> {
                        this.isOpenRequestResultModal = false;
                      },
                    };
                  }
                }, async (err) => {
                  await this.pageLoaderService.close();
                  this.isLoading = false;
                  this.isOpenRequestResultModal = true;
                  this.requestResultModal = {
                    title: 'Oops!',
                    desc: Array.isArray(err.message) ? err.message[0] : err.message,
                    type: 'failed',
                    retry: ()=> {
                      this.isOpenRequestResultModal = false;
                    },
                  };
                });
            },
          },
          {
            text: 'No',
            handler: async () => {
              sheet.dismiss();
            },
          },
        ],
      });
      await sheet.present();
    } catch (e){
      await this.pageLoaderService.close();
      this.isLoading = false;
      this.isOpenRequestResultModal = true;
      this.requestResultModal = {
        title: 'Oops!',
        desc: Array.isArray(e.message) ? e.message[0] : e.message,
        type: 'failed',
        retry: ()=> {
          this.isOpenRequestResultModal = false;
        },
      };
    }
  }

  async history() {
    try {
      if(!this.isAuthenticated) {
        this.authService.logOut();
      }
      const modal = await this.modalCtrl.create({
        component: RequestHistoryPage,
        cssClass: 'modal-fullscreen',
        backdropDismiss: false,
        canDismiss: true,
        enterAnimation: this.animationService.flyUpAnimation,
        leaveAnimation: this.animationService.leaveFlyUpAnimation,
        componentProps: { currentUser: this.currentUser },
      });
      modal.present();
    } catch(ex) {
      this.isLoading = false;
      await this.presentAlert({
        header: 'Try again!',
        message: 'Error loading reseravation',
        buttons: ['OK']
      });
    }
  }

  async presentAlert(options: any) {
    const alert = await this.alertController.create({

    });
    await alert.present();
  }
  logout() {
    this.authService.logOut();
  }

  isCurrentTab(index) {

  }
}
