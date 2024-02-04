/* eslint-disable prefer-const */
/* eslint-disable object-shorthand */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/member-ordering */
import { Component, OnInit, ViewChild } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem } from '@capacitor/filesystem';
import { ModalController, AlertController, ActionSheetController, Platform, IonModal } from '@ionic/angular';
import * as moment from 'moment';
import { ImageViewerPage } from 'src/app/shared/image-viewer/image-viewer.page';
import { EntityStatusEnum } from 'src/app/shared/enums/entity-status.enum';
import { environment } from 'src/environments/environment';
import { Member } from 'src/app/model/member';
import { Request } from 'src/app/model/request';
import { AppConfigService } from 'src/app/services/app-config.service';
import { UserService } from 'src/app/services/user.service';
import { RequestService } from 'src/app/services/request.service';
import { StorageService } from 'src/app/shared/storage/storage.service';
import { PageLoaderService } from 'src/app/shared/ui-service/page-loader.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { RequestRequirements } from 'src/app/model/request-requirements';
import { AuthService } from 'src/app/services/auth.service';
import { PdfViewerPage } from 'src/app/shared/pdf-viewer/pdf-viewer.page';
import { RequestType } from 'src/app/model/request-type';
import { AnimationService } from 'src/app/services/animation.service';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { URLToBase64 } from 'src/app/shared/utils/utils';
import { Files } from 'src/app/model/files';
import { SelectRequestTypePage } from 'src/app/shared/select-request-type/select-request-type.page';

@Component({
  selector: 'app-request-details',
  templateUrl: './request-details.page.html',
  styleUrls: ['./request-details.page.scss'],
})
export class RequestDetailsPage implements OnInit {
  modal;
  isNew = false;
  hasChanges = false;
  currentUser: Member;
  isLoading = false;
  details: Request = {} as any;
  activeAditionalBackdrop = false;
  isSubmitting = false;
  isOpenRequestResultModal = false;
  requestResultModal: { type: 'success' | 'failed' | 'warning'; title: string; desc: string; done?; retry? };
  selectedRequestType: RequestType;
  description = new FormControl(null, [Validators.required]);
  form = new FormGroup({
    requestTypeId : new FormControl(null, [Validators.required]),
    requestedById : new FormControl(null, [Validators.required]),
    description: new FormControl(null, [Validators.required]),
  });
  @ViewChild('descriptionModal', { static: false }) descriptionModal: IonModal;
  @ViewChild('fileUploadModal', { static: false }) fileUploadModal: IonModal;
  requirements: RequestRequirements[] = [];
  viewRequirement: RequestRequirements;

  constructor(private modalCtrl: ModalController,
    private alertController: AlertController,
    private actionSheetController: ActionSheetController,
    private platform: Platform,
    private pageLoaderService: PageLoaderService,
    private storageService: StorageService,
    private authService: AuthService,
    private animationService: AnimationService,
    private userService: UserService,
    private appconfig: AppConfigService,
    private requestService: RequestService) {
      this.currentUser = this.storageService.getLoginUser();
      this.form.controls.requestedById.setValue(this.currentUser.memberId);
      this.platform.backButton.subscribeWithPriority(-1, () => {
        this.close();
      });
  }

  get valid() {
    return this.form.valid;
  }

  get isAuthenticated() {
    const currentUser = this.storageService.getLoginUser();
    return currentUser &&
    currentUser?.memberCode &&
    currentUser?.user &&
    currentUser?.user?.userId;
  }

  get isRequirementsReady() {
    console.log('some is loading ', this.selectedRequestType?.requestRequirements.some(x=>x.isLoading));
    return !this.selectedRequestType?.requestRequirements.some(x=>x.isLoading && x.requireToSubmitProof);
  }

  ngOnInit() {
    if(!this.isNew) {
      this.getRequest(this.details.requestNo);
    }
  }


  async onShowSearchRequestType() {
    if(!this.isAuthenticated) {
      this.authService.logOut();
    }
    try {
      let modal: HTMLIonModalElement;
      modal = await this.modalCtrl.create({
        component: SelectRequestTypePage,
        cssClass: 'modal-fullscreen',
        backdropDismiss: false,
        canDismiss: true,
        enterAnimation: this.animationService.flyUpAnimation,
        leaveAnimation: this.animationService.leaveFlyUpAnimation,
        componentProps: { modal, currentUser: this.currentUser },
      });
      modal.present();
      modal.onDidDismiss().then((res: { data: RequestType; role: 'confirm'})=> {
        console.log(res);
        if(res?.role && res?.role === 'confirm' && res?.data) {
          this.selectedRequestType = res?.data;
          this.requirements = [];
          if(this.selectedRequestType?.requestRequirements) {
            for(const item of this.selectedRequestType?.requestRequirements) {
              item.files = [];
              this.requirements.push(item);
            }
          }
          this.form.controls.requestTypeId.setValue(this.selectedRequestType?.requestTypeId);
        }
      });
    } catch(ex) {
      await this.presentAlert({
        header: 'Try again!',
        message: Array.isArray(ex.message) ? ex.message[0] : ex.message,
        buttons: ['OK'],
      });
    }
  }

  async getRequest(requestNo: string) {
    try{
      this.isLoading = true;
      this.requestService.getById(requestNo)
      .subscribe(async res => {
        if(res.success){
          this.details = res.data;
          this.requirements = res.data.requestType?.requestRequirements;
          for(const submittedRequirement of res.data?.submittedRequirements) {
            const findIndex = this.requirements
            .findIndex(x=>x.requestRequirementsId === submittedRequirement?.requestRequirements?.requestRequirementsId);
            if(findIndex > -1) {
              this.requirements[findIndex].files = submittedRequirement.files;
              this.requirements[findIndex].isLoading = true;
              for(const file of this.requirements[findIndex].files) {
                URLToBase64(file.url, (dataUrl) => {
                  console.log(dataUrl);
                  file.data = dataUrl?.split(',')[1];
                  console.log(file);
                  this.requirements[findIndex].isLoading = false;
                });
              }
            }
          }
          this.isLoading = false;
          this.form.controls.requestedById.setValue(this.details.requestedBy?.memberId);
          this.form.controls.requestTypeId.setValue(this.details.requestType?.requestTypeId);
          this.form.controls.description.setValue(this.details.description);
          this.selectedRequestType = this.details.requestType;
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
      this.isLoading = false;
      await this.presentAlert({
        header: 'Try again!',
        subHeader: '',
        message: Array.isArray(e.message) ? e.message[0] : e.message,
        buttons: ['OK']
      });
    }
  }

  onShowDescriptionModal() {
    if(!this.isAuthenticated) {
      this.authService.logOut();
    }
    if(this.descriptionModal) {
      if(!this.isNew && !['PENDING', 'TOPAY'].some(x=>x === this.details.requestStatus)) {
        this.description.disable();
      }
      this.description.setValue(this.form.controls.description.value);
      this.description.markAsUntouched();
      this.description.markAsPristine();
      this.description.updateValueAndValidity();
      this.descriptionModal.present();
    }
  }

  async onSaveDescription() {
    this.form.controls.description.setValue(this.description.value);
    this.form.controls.description.markAsDirty();
    this.description.setErrors(null);
    this.description.markAsPristine();
    this.description.updateValueAndValidity();
    this.descriptionModal.dismiss();
  }

  onShowFileUploadModal(requirements: RequestRequirements) {
    if(!this.isAuthenticated) {
      this.authService.logOut();
    }
    if(this.fileUploadModal) {
      this.viewRequirement = requirements;
      this.fileUploadModal.present();
    }
  }

  async onUpload() {
    const result = await FilePicker.pickFiles({
      types: ['image/png', 'application/jpg','image/jpeg', 'application/pdf'],
      multiple: true,
      readData: true
    });
    console.log(result);
    const errors = [];
    const files: Files[] = [];
    for(const file of result.files) {
      const fileSizeMB = Math.round(((file.size / (1024*1024)) + Number.EPSILON) * 100) / 100;
      if(fileSizeMB <= 5) {
        files.push({
          data: file.data,
          name: file.name,
          url: `data:${file.mimeType};base64,${file.data}`,
        });
      } else {
        errors.push('A file cannot be larger than 5 MB.');
      }
    }
    if(errors.length > 0) {
      await this.presentAlert({
        header: 'Oops!',
        message: errors[0],
        buttons: ['OK'],
      });
    } else {
      this.viewRequirement.files = files;
      this.viewRequirement.isLoading = false;
      console.log(this.viewRequirement.files);
    }
  }

  async removeFile(fileIndex: number) {
    this.viewRequirement.files.splice(fileIndex, 1);
  }

  async onViewFile(file: Files) {
    // window.open(file.url);
    const isImage = ['png','jpg','jpeg'].some(x=> x === file.name.split('.').pop().toLocaleLowerCase());
    if(isImage) {
      const modal = await this.modalCtrl.create({
        component: ImageViewerPage,
        cssClass: 'modal-fullscreen',
        componentProps: { file: file },
      });
      modal.present();
    } else {
      const modal = await this.modalCtrl.create({
        component: PdfViewerPage,
        cssClass: 'modal-fullscreen',
        componentProps: { url: file.url, name: file.name },
      });
      modal.present();
    }
  }


  async onSubmit() {
    try {
      if(this.requirements.some(x=>x.requireToSubmitProof && x.files.length === 0)) {
        await this.presentAlert({
          header: 'Oops!',
          message: `Please upload files or pictures for the requirements: ${this.requirements
            .filter(x=>x.requireToSubmitProof && x.files.length === 0)
            .map(x=>x.name).join(', ')}`,
          buttons: ['OK'],
        });
        return;
      }
      const sheet = await this.actionSheetController.create({
        cssClass: 'app-action-sheet',
        header: `Are you sure you want to send the request?`,
        buttons: [
          {
            text: 'Yes?',
            handler: async () => {
              sheet.dismiss();
              if(this.isNew) {
                await this.create();
              } else {
                await this.update();
              }
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
    }
    catch(ex) {
      this.isSubmitting = false;
      await this.pageLoaderService.close();
      await this.presentAlert({
        header: 'Try again!',
        message: Array.isArray(ex.message) ? ex.message[0] : ex.message,
        buttons: ['OK'],
      });
    }
  }

  async create() {
    const params = {
      ...this.form.value,
      requirements: this.requirements.filter(x=>x.requireToSubmitProof).map(x => ({
          requestRequirementsId: x.requestRequirementsId,
          files: x.files,
        }))
    };
    console.log('create params', params);
    try {
      await this.pageLoaderService.open('Sending request please wait...');
      this.isSubmitting = true;
      this.requestService.create(params)
        .subscribe(async res => {
          if (res.success) {
            await this.pageLoaderService.close();
            this.isOpenRequestResultModal = true;
            this.requestResultModal = {
              title: 'Success!',
              desc: 'Request was successfully submitted.',
              type: 'success',
              done: ()=> {
                this.isOpenRequestResultModal = false;
                this.modal.dismiss(res.data, 'confirm');
              }
            };
          } else {
            this.isSubmitting = false;
            await this.pageLoaderService.close();
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
        });
    } catch (e) {
      this.isSubmitting = false;
      await this.pageLoaderService.close();
      await this.presentAlert({
        header: 'Try again!',
        message: Array.isArray(e.message) ? e.message[0] : e.message,
        buttons: ['OK'],
      });
    }
  }
  async update() {
    const params = {
      ...this.form.value,
      requirements: this.requirements.filter(x=>x.requireToSubmitProof).map(x => ({
          requestRequirementsId: x.requestRequirementsId,
          files: x.files,
        }))
    };
    try {
      await this.pageLoaderService.open('Saving changes please wait...');
      this.isSubmitting = true;
      this.requestService.update(this.details?.requestNo, params)
        .subscribe(async res => {
          if (res.success) {
            await this.pageLoaderService.close();
            this.isOpenRequestResultModal = true;
            this.requestResultModal = {
              title: 'Success!',
              desc: 'Request was successfully updated.',
              type: 'success',
              done: ()=> {
                this.isOpenRequestResultModal = false;
                this.modal.dismiss(res.data, 'confirm');
              }
            };
          } else {
            this.isSubmitting = false;
            await this.pageLoaderService.close();
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
        });
    } catch (e) {
      this.isSubmitting = false;
      await this.pageLoaderService.close();
      await this.presentAlert({
        header: 'Try again!',
        message: Array.isArray(e.message) ? e.message[0] : e.message,
        buttons: ['OK'],
      });
    }
  }

  async onCompleteRequest() {
    const sheet = await this.actionSheetController.create({
      cssClass: 'app-action-sheet',
      header: `Are you sure you want to complete the request now?`,
      buttons: [
        {
          text: 'YES Complete the request',
          handler: async () => {
            sheet.dismiss();
            await this.pageLoaderService.open('Processing please wait...');
            this.isLoading = true;
            this.requestService.completeRequest(this.details.requestNo, {})
              .subscribe(async res => {
                if (res.success) {
                  await this.pageLoaderService.close();
                  this.isLoading = false;
                  this.isOpenRequestResultModal = true;
                  this.requestResultModal = {
                    title: 'Success!',
                    desc: 'Request completed!',
                    type: 'success',
                    done: async ()=> {
                      this.isOpenRequestResultModal = false;
                      this.modal.dismiss(res.data, 'confirm');
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
    sheet.present();
  }

  async onCancelRequest() {
    const sheet = await this.actionSheetController.create({
      cssClass: 'app-action-sheet',
      header: `Are you sure you want to cancel request?`,
      buttons: [
        {
          text: 'YES Cancel',
          handler: async () => {
            sheet.dismiss();
            await this.pageLoaderService.open('Processing please wait...');
            this.isLoading = true;
            this.requestService.cancelRequest(this.details.requestNo, {})
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
                      this.modal.dismiss(res.data, 'confirm');
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
    sheet.present();
  }

  close() {
    return this.modal.dismiss(this.hasChanges ? this.hasChanges : null, 'cancel');
  }

  async presentAlert(options: any) {
    const alert = await this.alertController.create(options);
    await alert.present();
  }

}
