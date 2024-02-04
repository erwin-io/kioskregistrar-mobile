/* eslint-disable @typescript-eslint/member-ordering */
import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonRefresher, ModalController } from '@ionic/angular';
import { RequestType } from 'src/app/model/request-type';
import { RequestTypeService } from 'src/app/services/request-type.service';

@Component({
  selector: 'app-select-request-type',
  templateUrl: './select-request-type.page.html',
  styleUrls: ['./select-request-type.page.scss'],
})
export class SelectRequestTypePage implements OnInit {
  isLoading = false;
  selected: RequestType;
  requestTypeList: RequestType[] = [];
  pageIndex = 0;
  pageSize = 10;
  total = 0;
  @ViewChild(IonRefresher)ionRefresher: IonRefresher;
  constructor(private modalCtrl: ModalController,
    private alertController: AlertController,
    private requestTypeService: RequestTypeService) { }

  ngOnInit() {

    this.pageIndex = 0;
    this.pageSize = 10;
    this.requestTypeList = [];
    this.initList('', true);
  }

  async loadMore() {
    this.pageIndex = this.pageIndex + 1;
    await this.initList();
  }

  async search(searchKey = '') {
    this.pageIndex = 0;
    this.pageSize = 10;
    this.requestTypeList = [];
    await this.initList(searchKey, true);
  }


  async doRefresh(){
    try {
      if(this.isLoading) {
        return;
      }
      this.pageIndex = 0;
      this.pageSize = 10;
      this.requestTypeList = [];
      await this.initList('', true);
    }catch(ex) {
      if(this.ionRefresher) {
        this.ionRefresher.complete();
      }
      await this.presentAlert({
        header: 'Try again!',
        message: 'Error loading',
        buttons: ['OK']
      });
    }
  }

  async initList(searchKey = '', showProgress = false) {
    try {
      this.isLoading = showProgress;
      this.requestTypeService.getByAdvanceSearch({
        order: {
          name: 'ASC'
        },
        columnDef: [{
          apiNotation: 'name',
          filter: searchKey
        }],
        pageIndex: this.pageIndex,
        pageSize: this.pageSize
      })
      .subscribe(async res => {
        if(res.success){
          this.requestTypeList = [...this.requestTypeList, ...res.data.results];
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

  select(selected: RequestType) {
    return this.modalCtrl.dismiss(selected, 'confirm');
  }

  close() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  async presentAlert(options: any) {
    const alert = await this.alertController.create({

    });
    await alert.present();
  }

}
