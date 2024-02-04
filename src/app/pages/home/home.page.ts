import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, AlertController } from '@ionic/angular';
import { forkJoin } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { StorageService } from 'src/app/shared/storage/storage.service';
import { PageLoaderService } from 'src/app/shared/ui-service/page-loader.service';
import { SettingsPage } from '../settings/settings.page';
import { RequestDetailsPage } from '../request/request-details/request-details.page';
import { DashboardService } from 'src/app/services/dashboard.service';
import { Request } from 'src/app/model/request';
import { Member } from 'src/app/model/member';
import { Files } from 'src/app/model/files';
import { DomSanitizer } from '@angular/platform-browser';
import { URLToBase64 } from 'src/app/shared/utils/utils';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  isLoading = false;
  pendingPrio: Request;
  totalPending = 0;

  toCompletePrio: Request;
  totalToComplete = 0;

  toPayPrio: Request;
  totalToPay = 0;

  processingPrio: Request;
  totalProcessing = 0;

  hasChanges = false;
  refreshEvent: any;
  currentProfile: Member;
  profilePic: Files;
  constructor(
    private router: Router,
    private authService: AuthService,
    private modalCtrl: ModalController,
    private dashboardService: DashboardService,
    private storageService: StorageService,
    private alertController: AlertController,
    private sanitizer: DomSanitizer,
    private pageLoaderService: PageLoaderService
  ) {
    this.currentProfile = this.storageService.getLoginUser();
    if(this.currentProfile?.user?.profileFile?.url) {
      this.profilePic = this.currentProfile?.user?.profileFile;
    }


    if(this.isAuthenticated) {
      this.initDashboard(this.currentProfile.memberId);
    }
  }

  get isAuthenticated() {
    const currentUser = this.storageService.getLoginUser();
    return currentUser &&
    currentUser.memberId &&
    currentUser.user?.userId;
  }

  get user() {
    return this.storageService.getLoginUser();
  }

  async initDashboard(memberId){
    this.isLoading = true;
    forkJoin(
      this.dashboardService.getMemberDashboard(memberId)
  ).subscribe(
      ([status]) => {
        this.pendingPrio = status?.data?.pending?.prio;
        this.totalPending = status?.data?.pending?.total;

        this.toPayPrio = status?.data?.toPay?.prio;
        this.totalToPay = status?.data?.toPay?.total;

        this.toCompletePrio = status?.data?.toComplete?.prio;
        this.totalToComplete = status?.data?.toComplete?.total;

        this.processingPrio = status?.data?.processing?.prio;
        this.totalProcessing = status?.data?.processing?.total;

      },
      (error) => console.error(error),
      () => {
        this.isLoading = false;
        this.hasChanges = false;
      }
  );
  }

  getSafeImageSource(source: any) {
    try {
      if(source && source.toString().toLowerCase().includes('data:') && source.toString().toLowerCase().includes('base64')) {
        return source;
      } else {
        return source && source !== '' ? this.sanitizer.bypassSecurityTrustUrl(source) as any: null;
      }
    } catch(ex) { return null;}
  }

  async ngOnInit() {
    await this.pageLoaderService.close();
    try {
      URLToBase64(this.profilePic?.url, (dataUrl) => {
        this.profilePic.url = dataUrl;
        this.profilePic.ready = true;
      });
    } catch(ex) {
      this.profilePic.url = this.getDeafaultProfilePicture();
      this.profilePic.ready = true;
    }
  }

  async onOpenDetails(details) {
    const modal = await this.modalCtrl.create({
      component: RequestDetailsPage,
      cssClass: 'modal-fullscreen',
      componentProps: { details, currentUser: this.user },
    });
    modal.present();
    await modal.onWillDismiss();
  }


  async onShowSettings() {

    if(!this.isAuthenticated) {
      // this.authService.logout();
    }
    let modal: HTMLIonModalElement = null;
    modal = await this.modalCtrl.create({
      component: SettingsPage,
      cssClass: 'modal-fullscreen',
      backdropDismiss: false,
      canDismiss: true,
      componentProps: { modal },
    });
    modal.present();
    modal.onDidDismiss().then(res=> {
      if(res?.data) {
        this.currentProfile = res.data;
        this.profilePic = this.currentProfile?.user?.profileFile;
        this.ngOnInit();
      }
    });
    console.log('open settings');
  }

  ionViewWillEnter() {
    console.log('visited');
  }

  async doRefresh(event: any){
    try {
      this.refreshEvent = event;
      await this.initDashboard(this.currentProfile.memberId).finally(()=> {

        if(this.refreshEvent) {
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

  profilePicErrorHandler(event) {
    event.target.src = this.getDeafaultProfilePicture();
  }

  getDeafaultProfilePicture() {
    if(this.currentProfile && this.currentProfile.gender?.toUpperCase() === 'FEMALE') {
      return '../../../../../assets/img/person-female.png';
    } else {
      return '../../../../../assets/img/person.png';
    }
  }

  async presentAlert(options: any) {
    const alert = await this.alertController.create(options);
    await alert.present();
  }
}
