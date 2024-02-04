import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  ActionSheetController,
  AlertController,
  ModalController,
  NavController,
} from '@ionic/angular';
import { PasswordAndSecurityPage } from './password-and-security/password-and-security.page';
import { ProfileSettingsPage } from './profile-settings/profile-settings.page';
import { Platform } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { Filesystem, Directory } from '@capacitor/filesystem';
import {
  Camera,
  CameraResultType,
  CameraSource,
  Photo,
} from '@capacitor/camera';
import { Member } from 'src/app/model/member';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { StorageService } from 'src/app/shared/storage/storage.service';
import { DomSanitizer } from '@angular/platform-browser';
import { async } from 'rxjs';
import { URLToBase64 } from 'src/app/shared/utils/utils';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  currentProfile: Member;
  profilePicSource;
  modal: HTMLIonModalElement;
  routerOutlet: any;
  isSubmitting = false;
  hasChanges = false;
  constructor(
    private actionSheetController: ActionSheetController,
    private platform: Platform,
    private userService: UserService,
    private router: Router,
    private authService: AuthService,
    private modalCtrl: ModalController,
    private storageService: StorageService,
    private sanitizer: DomSanitizer,
    private alertController: AlertController
  ) {
    this.currentProfile = this.storageService.getLoginUser();
    // this.platform.backButton.subscribeWithPriority(-1, () => {
    //   this.close();
    // });
    this.profilePicSource = this.currentProfile?.user?.profileFile;
  }

  ngOnInit() {
    try {
      URLToBase64(this.profilePicSource?.url, (dataUrl) => {
        this.profilePicSource.url = dataUrl;
        this.profilePicSource.ready = true;
      });
    } catch(ex) {
      this.profilePicSource.url = this.getDeafaultProfilePicture();
      this.profilePicSource.ready = true;
    }
  }

  getSafeImageSource(source: any) {
    try {
      if(source && source.toString().toLowerCase().includes('data:') && source.toString().toLowerCase().includes('base64')) {
        return source;
      } else {
        return source && source === '' ? this.sanitizer.bypassSecurityTrustUrl(source) as any: null;
      }
    } catch(ex) { return null;}
  }

  async onSettingsMenuClick(item: string) {
    // this.navCtrl.navigateForward([item]);
    let modal: HTMLIonModalElement = null;
    switch (item) {
      case 'profile-settings':
        modal = await this.modalCtrl.create({
          component: ProfileSettingsPage,
          cssClass: 'modal-fullscreen',
          backdropDismiss: false,
          canDismiss: true,
          componentProps: { modal },
        });
        modal.onDidDismiss().then((res: { data: any; role: string }) => {
          if (res.data && res.role === 'confirm') {
            this.currentProfile = res.data;
            this.profilePicSource = this.currentProfile?.user?.profileFile;
            this.hasChanges = true;
            URLToBase64(this.profilePicSource?.url, (dataUrl) => {
              this.profilePicSource.url = dataUrl;
              this.profilePicSource.ready = true;
            });
          }
        });
        modal.present();
        break;
      case 'password-and-security':
        modal = await this.modalCtrl.create({
          component: PasswordAndSecurityPage,
          cssClass: 'modal-fullscreen',
          backdropDismiss: false,
          canDismiss: true,
          componentProps: { modal },
        });
        modal.present();
        break;
    }
  }

  async signout() {
    const actionSheet = await this.actionSheetController.create({
      cssClass: 'app-action-sheet',
      buttons: [
        {
          text: 'Logout?',
          handler: async () => {
            const logoutSheet = await this.actionSheetController.create({
              cssClass: 'app-action-sheet',
              header: 'Do you want to logout?',
              buttons: [
                {
                  text: 'Yes?',
                  handler: async () => {
                    this.authService.logOut();
                    logoutSheet.dismiss();
                    actionSheet.dismiss();
                  },
                },
                {
                  text: 'No',
                  handler: async () => {
                    logoutSheet.dismiss();
                    actionSheet.dismiss();
                  },
                },
              ],
            });
            await logoutSheet.present();
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

  ionViewWillEnter() {}

  close() {
    this.modal.dismiss(this.hasChanges ? this.currentProfile : null, 'cancel');
  }

  toggleDarkMode() {
    // Use matchMedia to check the user preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    this.toggleDarkTheme(prefersDark.matches);

    // Listen for changes to the prefers-color-scheme media query
    prefersDark.addListener((mediaQuery) =>
      this.toggleDarkTheme(mediaQuery.matches)
    );
  }

  // Add or remove the "dark" class based on if the media query matches
  toggleDarkTheme(shouldAdd) {
    document.body.classList.toggle('dark', shouldAdd);
  }

  async readAsBase64(photo: Photo) {
    if (this.platform.is('hybrid')) {
      const file = await Filesystem.readFile({
        path: photo.path,
      });

      return file.data;
    } else {
      // Fetch the photo, read as a blob, then convert to base64 format
      const response = await fetch(photo.webPath);
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

  async presentAlert(options: any) {
    const alert = await this.alertController.create(options);
    return await alert.present();
  }
}
