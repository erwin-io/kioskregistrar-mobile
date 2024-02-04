import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActionSheetController, AlertController } from '@ionic/angular';
import { MyErrorStateMatcher } from 'src/app/shared/form-validation/error-state.matcher';
import { Member } from 'src/app/model/member';
import { UserService } from 'src/app/services/user.service';
import { StorageService } from 'src/app/shared/storage/storage.service';
import { PageLoaderService } from 'src/app/shared/ui-service/page-loader.service';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-password-and-security',
  templateUrl: './password-and-security.page.html',
  styleUrls: ['./password-and-security.page.scss'],
})
export class PasswordAndSecurityPage implements OnInit {
  modal;
  currentProfile: Member;
  changePasswordForm: FormGroup;
  activeAditionalBackdrop = false;
  isSubmitting = false;
  matcher = new MyErrorStateMatcher();
  error;
  constructor(
    private actionSheetController: ActionSheetController,
    private authService: AuthService,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private alertController: AlertController,
    private pageLoaderService: PageLoaderService,
    private router: Router,
    private storageService: StorageService) {
    this.currentProfile = this.storageService.getLoginUser();
  }

  get formData() {
    return {
      ...this.changePasswordForm.value,
      userId: this.currentProfile?.user?.userId
    };
  }

  get errorControls() {
    return this.changePasswordForm.controls;
  }

  get notSameValueErrorHandler() {
    return this.changePasswordForm.errors;
  }

  ngOnInit() {
    console.log(this.currentProfile);
    this.initForm();
    console.log(this.formData);
  }

  initForm() {
    this.changePasswordForm = this.formBuilder.group({
    currentPassword : [null, Validators.required],
    password : [null, Validators.required],
    confirmPassword : '',
  }, { validators: this.checkPasswords });
}

  checkPasswords: ValidatorFn = (group: AbstractControl):  ValidationErrors | null => {
    const pass = group.get('password').value;
    const confirmPass = group.get('confirmPassword').value;
    return pass === confirmPass ? null : { notSame: true };
  };


  async onSubmit() {
    const params = this.formData;
    console.log(params);
    if (!this.changePasswordForm.valid) {
      return;
    }
    try {
      const sheet = await this.actionSheetController.create({
        cssClass: 'app-action-sheet',
        header: `Are you sure you want to change your password?`,
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
      await this.pageLoaderService.open('Saving password...');
      this.isSubmitting = true;
      let res = await this.authService.login({
        userName: this.currentProfile.user.userName,
        password: params.currentPassword,
      }).toPromise();
      if(!res.success) {
        this.isSubmitting = false;
        this.changePasswordForm.controls.currentPassword.setErrors( { invalid: true });
        this.changePasswordForm.controls.currentPassword.markAllAsTouched();
        await this.pageLoaderService.close();
        return;
      }
      this.changePasswordForm.controls.currentPassword.setErrors(null);
      res = await this.userService.resetMemberPassword(this.currentProfile.memberCode, params).toPromise();

      this.isSubmitting = false;
      await this.pageLoaderService.close();
      if (res.success) {
        await this.presentAlert({
          header: 'Password updated!',
          buttons: ['OK'],
        });
        this.modal.dismiss(res.data, 'confirm');
      } else {
        await this.presentAlert({
          header: res.message,
          buttons: ['OK'],
        });
      }
    } catch (e) {
      this.isSubmitting = false;
      await this.pageLoaderService.close();
      this.error = Array.isArray(e.message)
        ? e.message[0]
        : e.message;
      await this.presentAlert({
        header: 'Try again!',
        message: this.error,
        buttons: ['OK'],
      });
    }
  }

  close() {
    this.modal.dismiss(null, 'cancel');
  }

  async presentAlert(options: any) {
    const alert = await this.alertController.create(options);
    return await alert.present();
  }
}
