import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Filesystem } from '@capacitor/filesystem';
import { ActionSheetController, AlertController, ModalController, Platform } from '@ionic/angular';
import * as moment from 'moment';
import { forkJoin } from 'rxjs';
import { Courses } from 'src/app/model/courses.model';
import { Files } from 'src/app/model/files';
import { Member } from 'src/app/model/member';
import { CoursesService } from 'src/app/services/courses.service';
import { UserService } from 'src/app/services/user.service';
import { StorageService } from 'src/app/shared/storage/storage.service';
import { PageLoaderService } from 'src/app/shared/ui-service/page-loader.service';
import { URLToBase64, generateSchoolYear } from 'src/app/shared/utils/utils';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.page.html',
  styleUrls: ['./profile-settings.page.scss'],
})
export class ProfileSettingsPage implements OnInit {
  modal;
  currentProfile: Member;
  editProfileForm: FormGroup;
  activeAditionalBackdrop = false;
  isSubmitting = false;
  profilePic: Files;
  courses: Courses[] = [];
  constructor(
    private actionSheetController: ActionSheetController,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private alertController: AlertController,
    private pageLoaderService: PageLoaderService,
    private platform: Platform,
    private coursesService: CoursesService,
    private sanitizer: DomSanitizer,
    private storageService: StorageService) {
    this.currentProfile = this.storageService.getLoginUser();
    if(this.currentProfile?.user?.profileFile?.url) {
      this.profilePic = this.currentProfile?.user?.profileFile;
    }
  }

  get f() {
    return this.editProfileForm.controls;
  }
  get formIsValid() {
    return this.editProfileForm.valid;
  }

  get formData() {
    return {
      ...this.editProfileForm.value,
      userId: this.currentProfile && this.currentProfile?.user ? this.currentProfile?.user?.userId : null,
      profileFile: this.profilePic && this.profilePic?.data ? this.profilePic : null
    };
  }

  get yearList() {
    return generateSchoolYear(1950, false);
  }

  get pairedYearList() {
    return generateSchoolYear(1950, true);
  }

  get isFormDirty() {
    return (
      this.currentProfile.fullName !== this.formData.fullName ||
      this.currentProfile.email !== this.formData.email ||
      this.currentProfile.mobileNumber !== this.formData.mobileNumber ||
      this.currentProfile.address !== this.formData.address ||
      moment(this.currentProfile.birthDate).format('YYYY-MM-DD') !== moment(this.formData.birthDate).format('YYYY-MM-DD') ||
      this.currentProfile.gender !== this.formData
    );
  }

  get errorControls() {
    return this.editProfileForm.controls;
  }

  getSafeImageSource(source: any) {
    try {
      if(source && source.toString().toLowerCase().includes('data:') && source.toString().toLowerCase().includes('base64')) {
        return source;
      } else {
        return source && source ? this.sanitizer.bypassSecurityTrustUrl(source) as any: null;
      }
    } catch(ex) { return null;}
  }

  ngOnInit() {
    try {
      URLToBase64(this.profilePic?.url, (dataUrl) => {
        this.profilePic.url = dataUrl;
        this.profilePic.ready = true;
      });
    } catch(ex) {
      this.profilePic.url = this.getDeafaultProfilePicture();
      this.profilePic.ready = true;
    }
    this.initFields();
    console.log(this.currentProfile);
    this.editProfileForm = this.formBuilder.group({
      fullName: [this.currentProfile.fullName, [ Validators.required, Validators.pattern('^[a-zA-Z0-9\\-\\s]+$')]],
      mobileNumber: [this.currentProfile.mobileNumber,
        [ Validators.minLength(11), Validators.maxLength(11), Validators.pattern('^[0-9]*$'), Validators.required]],
      email: [this.currentProfile.email, [ Validators.email, Validators.required]],
      birthDate: [new Date(this.currentProfile.birthDate).toISOString(), [ Validators.required]],
      gender: [this.currentProfile.gender, [ Validators.required]],
      address: [this.currentProfile.address, [ Validators.required]],
      courseTaken: [this.currentProfile.courseTaken, [ Validators.required]],
      major: [this.currentProfile.major],
      isAlumni: [this.currentProfile.isAlumni, [ Validators.required]],
      schoolYearLastAttended: [this.currentProfile.schoolYearLastAttended, [ Validators.required]],
      primarySchoolName: [this.currentProfile.primarySchoolName, [ Validators.required]],
      primarySyGraduated: [this.currentProfile.primarySyGraduated, [ Validators.required]],
      secondarySchoolName: [this.currentProfile.secondarySchoolName, [ Validators.required]],
      secondarySyGraduated: [this.currentProfile.secondarySyGraduated, [ Validators.required]],
    });
  }

  async initFields(type: 'courses' | any = '') {
    try {
      if(type === 'courses') {
        this.coursesService.getAll().subscribe(res=> { this.courses = res.data;});
      } else {
        forkJoin([
          this.coursesService.getAll(),
      ]).subscribe(results=> {
        const [courses] = results;
        this.courses = courses.data;
      });
      }
    } catch(ex) {
      await this.presentAlert({
        header: 'Try again!',
        message: Array.isArray(ex.message) ? ex.message[0] : ex.message,
        buttons:  ['Ok']
      });
    }
  }

  async onSubmit() {
    const params = this.formData;
    console.log(params);
    if (!this.editProfileForm.valid) {
      return;
    }
    try {
      const sheet = await this.actionSheetController.create({
        cssClass: 'app-action-sheet',
        header: `Are you sure you want to update porfile?`,
        buttons: [{
            text: 'YES Continue',
            handler: async () => {
              this.save(params);
              sheet.dismiss();
            }
          },{
            text: 'CANCEL',
            handler: async () => {
              sheet.dismiss();
            }
          }]
      });
      sheet.present();
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

  async save(params) {
    try {
      await this.pageLoaderService.open('Saving...');
      this.isSubmitting = true;
      this.userService.updateMember(this.currentProfile?.memberCode, params).subscribe(
        async (res) => {
          if (res.success) {
            await this.pageLoaderService.close();
            await this.presentAlert({
              header: 'Saved!',
              buttons: ['OK'],
            });
            this.isSubmitting = false;
            this.currentProfile = res.data;
            this.storageService.saveLoginUser(this.currentProfile);
            this.modal.dismiss(res.data, 'confirm');
          } else {
            this.isSubmitting = false;
            await this.pageLoaderService.close();
            await this.presentAlert({
              header: 'Try again!',
              message: Array.isArray(res.message)
                ? res.message[0]
                : res.message,
              buttons: ['OK'],
            });
          }
        },
        async (err) => {
          this.isSubmitting = false;
          await this.pageLoaderService.close();
          await this.presentAlert({
            header: 'Try again!',
            message: Array.isArray(err.message) ? err.message[0] : err.message,
            buttons: ['OK'],
          });
        }
      );
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

  async onChangeProfilePic() {
    const actionSheet = await this.actionSheetController.create({
      cssClass: 'sched-card-action-sheet',
      buttons: [
        {
          text: 'Camera',
          handler: async () => {
            const image = await Camera.getPhoto({
              quality: 90,
              allowEditing: false,
              resultType: CameraResultType.DataUrl,
              source: CameraSource.Camera, // Camera, Photos or Prompt!
            });
            if (image) {
              const base64Data = await this.readAsBase64(image);
              console.log('base64Data', base64Data);
              console.log('image', image);
              if (this.platform.is('hybrid')) {
                if(!this.profilePic || this.profilePic?.url) {
                  this.profilePic = {
                    url: image.dataUrl,
                    name: `profle.${image.format}`,
                    data: base64Data,
                    ready: true
                  };
                }
              } else {
                if(!this.profilePic || this.profilePic?.url) {
                  this.profilePic = {
                    url: image.dataUrl,
                    name: `profle.${image.format}`,
                    data: base64Data,
                    ready: true
                  };
                }
              }
              console.log('profilePic', this.profilePic);
            }
            actionSheet.dismiss();
          },
        },
        {
          text: 'Gallery',
          handler: async () => {
            const image = await Camera.getPhoto({
              quality: 90,
              allowEditing: false,
              resultType: CameraResultType.DataUrl,
              source: CameraSource.Photos, // Camera, Photos or Prompt!
            });
            if (image) {
              const base64Data = await this.readAsBase64(image);
              console.log('base64Data', base64Data);
              console.log('image', image);
              if (this.platform.is('hybrid')) {
                if(!this.profilePic || this.profilePic?.url) {
                  this.profilePic = {
                    url: image.dataUrl,
                    name: `profle.${image.format}`,
                    data: base64Data,
                    ready: true
                  };
                }
              } else {
                if(!this.profilePic || this.profilePic?.url) {
                  this.profilePic = {
                    url: image.dataUrl,
                    name: `profle.${image.format}`,
                    data: base64Data,
                    ready: true
                  };
                }
              }
              console.log('profilePic', this.profilePic);
            }
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

    // const result = await actionSheet.onDidDismiss();
    // console.log(result);
  }
  async readAsBase64(photo: Photo) {
    if (this.platform.is('hybrid')) {
      const file = await Filesystem.readFile({
        path: photo.path,
      });

      return file.data;
    } else {
      // Fetch the photo, read as a blob, then convert to base64 format
      const response = await fetch(photo.dataUrl);
      const blob = await response.blob();

      const base64 = (await this.convertBlobToBase64(blob)) as string;
      return base64.split(',')[1];
    }
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  convertBlobToBase64 = (blob: Blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });

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

  getError(key: string) {
    return (this.f[key].invalid && this.f[key].dirty) || (this.f[key].touched && this.f[key].dirty)? this.f[key].errors : null;
  }

  close() {
    this.modal.dismiss(null, 'cancel');
  }

  async presentAlert(options: any) {
    const alert = await this.alertController.create(options);
    return await alert.present();
  }
}
