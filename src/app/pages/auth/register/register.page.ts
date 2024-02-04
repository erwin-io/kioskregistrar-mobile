/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/member-ordering */
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, NgForm, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { AnimationController, IonModal, ToastController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { MyErrorStateMatcher } from '../../../shared/form-validation/error-state.matcher';
import { Auth, RecaptchaVerifier, signInWithPhoneNumber } from '@angular/fire/auth';
import { NgOtpInputComponent, NgOtpInputConfig } from 'ng-otp-input';
import { forkJoin } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AppConfigService } from 'src/app/services/app-config.service';
import { AuthService } from 'src/app/services/auth.service';
import { FirebaseAuthService } from 'src/app/services/firebase-auth.service';
import { StorageService } from 'src/app/shared/storage/storage.service';
import { PageLoaderService } from 'src/app/shared/ui-service/page-loader.service';
import { Member } from 'src/app/model/member';
import { generateSchoolYear } from 'src/app/shared/utils/utils';
import { CoursesService } from 'src/app/services/courses.service';
import { Courses } from 'src/app/model/courses.model';
@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss']
})
export class RegisterPage implements OnInit {
  isSubmitting = false;
  courses: Courses[] = [];
  registerForm: FormGroup;
  matcher = new MyErrorStateMatcher();
  defaultDate = new Date();
  otpCtrl = new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]);
  @ViewChild('verifyNumberModal') verifyNumberModal: IonModal;
  otpConfig: NgOtpInputConfig = {
    length: 6,
    allowNumbersOnly: true,
    inputClass: 'otp-input-style',
    containerClass: ''
  };
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private appconfig: AppConfigService,
    private animationCtrl: AnimationController,
    private authService: AuthService,
    private coursesService: CoursesService,
    private firebaseAuthService: FirebaseAuthService,
    private pageLoaderService: PageLoaderService,
    private storageService: StorageService,
    private alertController: AlertController) { }

  ngOnInit() {
    // const draft = localStorage.getItem('register-draft');
    // const data = draft ? JSON.parse(draft) : { };
    // const { firstName, middleName, lastName, email, mobileNumber, address, birthDate, genderId, userName, password, confirmPassword } = data;
    this.initFields();
    this.registerForm = this.formBuilder.group({
      fullName: [null, [ Validators.required, Validators.pattern('^[a-zA-Z0-9\\-\\s]+$')]],
      mobileNumber: [null,
        [ Validators.minLength(11), Validators.maxLength(11), Validators.pattern('^[0-9]*$'), Validators.required]],
      email: [null, [ Validators.email, Validators.required]],
      birthDate: [new Date(null).toISOString(), [ Validators.required]],
      gender: [null, [ Validators.required]],
      address: [null, [ Validators.required]],
      courseTaken: [null, [ Validators.required]],
      major: [null],
      isAlumni: [null, [ Validators.required]],
      schoolYearLastAttended: [null, [ Validators.required]],
      primarySchoolName: [null, [ Validators.required]],
      primarySyGraduated: [null, [ Validators.required]],
      secondarySchoolName: [null, [ Validators.required]],
      secondarySyGraduated: [null, [ Validators.required]],
      userName : [null, Validators.required],
      password : [null, Validators.required],
      confirmPassword: [null, Validators.required],
    }, { validators: this.checkPasswords });
  }

  async initFields(type: 'courses' | any = '') {
    try {
      if(type === 'courses') {
        this.coursesService.getAll().subscribe(res=> { this.courses = res.data;});
      } else {
        forkJoin([
          this.coursesService.getAll(),
      ]).subscribe(async results=> {
        const [courses] = results;
        if(courses.success) {
          this.courses = courses.data;
        } else {
          await this.presentAlert({
            header: 'Try again!',
            message: Array.isArray(courses.message) ? courses.message[0] : courses.message,
            buttons:  ['Ok']
          });
        }
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

  get controls() {
    return this.registerForm.controls;
  }

  get f() {
    return this.registerForm.controls;
  }
  get formIsValid() {
    return this.registerForm.valid;
  }

  get formData() {
    return this.registerForm.value;
  }

  get yearList() {
    return generateSchoolYear(1950, false);
  }

  get pairedYearList() {
    return generateSchoolYear(1950, true);
  }

  get isVerifying() {
    if(!this.firebaseAuthService) {
      return false;
    } else if(!this.firebaseAuthService.appVerifier) {
      return false;
    } else {
      return !this.firebaseAuthService.appVerifier.destroyed;
    }
  }

  checkPasswords: ValidatorFn = (group: AbstractControl):  ValidationErrors | null => {
    const pass = group.get('password').value;
    const confirmPass = group.get('confirmPassword').value;
    return pass === confirmPass ? null : { notSame: true };
  };

  async verify() {
    this.isSubmitting = true;
    if(this.otpCtrl.dirty || this.otpCtrl.valid) {
      this.otpCtrl.setErrors(null);
    }
    try {
      if(!this.registerForm.valid){
        this.isSubmitting = false;
        return;
      }

      const { userName, email, mobileNumber } = this.formData;

      await this.pageLoaderService.open('Processing please wait...');
      // const checkIfExist: {  data: any } [] = await forkJoin([
      //   this.authService.findByUsername(userName),
      //   this.authService.findByEmail(email),
      //   this.authService.findByMobileNumber(mobileNumber),
      // ]).toPromise();
      // console.log(checkIfExist);
      // if(checkIfExist[0].data) {
      //   await this.pageLoaderService.close();
      //   await this.presentAlert({
      //     header: 'Username already exist!',
      //     buttons: ['Ok']
      //   });
      //   this.isSubmitting = false;
      //   return;
      // } else if(checkIfExist[1].data) {
      //   await this.presentAlert({
      //     header: 'Email already in use!',
      //     buttons: ['Ok']
      //   });
      //   this.isSubmitting = false;
      //   return;
      // } else if(checkIfExist[2].data) {
      //   await this.pageLoaderService.close();
      //   await this.presentAlert({
      //     header: 'Mobile number already in use!',
      //     buttons: ['Ok']
      //   });
      //   this.isSubmitting = false;
      //   return;
      // }

      const phoneNumber = '+63' + Number(this.formData.mobileNumber);
      const response = await this.firebaseAuthService.signInWithPhoneNumber(phoneNumber);
      console.log(response);

      await this.verifyNumberModal.dismiss();
      await this.pageLoaderService.close();
      this.openVerifyModal();
      this.isSubmitting = false;
    } catch(ex) {
      this.isSubmitting = false;
      await this.pageLoaderService.close();
      await this.verifyNumberModal.dismiss();
      this.firebaseAuthService.appVerifier.clear();
      console.log(ex);
      // window.location.reload()
      let message = 'Try again later.';
      if(ex?.message.includes('Firebase: Error') && ex?.message.includes('too-many-requests')) {
        message = 'Too many request. Please wait for 5 minuets before you try again';
      } else if(ex?.message.includes('Firebase: Error') && ex?.message.includes('too-many-requests')) {
        message = 'Error verifying account. Please try again for a few minuets';
      }
      await this.presentAlert({
        header: 'Something went wrong!',
        message,
        buttons: ['Ok']
      });
      await this.refreshPage();
    }
  }

  async openVerifyModal() {
    try {
      const { enterAnimation, leaveAnimation } = {
        enterAnimation: (baseEl: HTMLElement) => {
          const root = baseEl.shadowRoot;
          const backdropAnimation = this.animationCtrl
            .create()
            .addElement(root.querySelector('ion-backdrop')!)
            .fromTo('opacity', '0.01', '0.8');

            const wrapperAnimation = this.animationCtrl
            .create()
            .addElement(root.querySelector('.modal-wrapper')!)
            .keyframes([
            { offset: 0, transform: 'translateY(100%)', opacity: '0.8' },
            { offset: 1, transform: 'translateY(0)', opacity: '1'  },
            ]);
            return this.animationCtrl
            .create()
            .addElement(baseEl)
            .easing('ease-out')
            .duration(200)
            .addAnimation([backdropAnimation, wrapperAnimation]);
        },
        leaveAnimation: (baseEl: HTMLElement) => enterAnimation(baseEl).direction('reverse')
      };
      this.verifyNumberModal.enterAnimation = enterAnimation;
      this.verifyNumberModal.leaveAnimation = leaveAnimation;
      this.verifyNumberModal.present();
    } catch(ex) {
      this.isSubmitting = false;
      throw ex;
    }
  }

  async resend() {
    try {
      this.isSubmitting = true;
      await this.pageLoaderService.open('Processing please wait...');
      const phoneNumber = '+63' + Number(this.formData.mobileNumber);
      const response = await this.firebaseAuthService.signInWithPhoneNumber(phoneNumber);
      await this.pageLoaderService.close();
      console.log(response);
    } catch(ex) {
      await this.pageLoaderService.close();
      await this.verifyNumberModal.dismiss();
      this.isSubmitting = false;
      // this.firebaseAuthService.appVerifier.clear();
      console.log(ex);
      let message = 'Try again later.';
      if(ex?.message.includes('Firebase: Error') && ex?.message.includes('too-many-requests')) {
        message = 'Too many request. Please wait for 5 minuets before you try again';
      } else if(ex?.message.includes('Firebase: Error') && ex?.message.includes('too-many-requests')) {
        message = 'Error verifying account. Please try again for a few minuets';
      }
      await this.presentAlert({
        header: 'Something went wrong!',
        message,
        buttons: ['Ok']
      });
      await this.refreshPage();
    }
  }

  async verifyOtp() {
    this.isSubmitting = true;
    if(!this.otpCtrl.valid) {
      this.otpConfig.containerClass = 'invalid';
      this.isSubmitting = false;
      return;
    }
    this.otpConfig.containerClass = '';
    console.log(this.otpCtrl.value);
    try {

      await this.pageLoaderService.open('Verifying please wait...');
      const response = await this.firebaseAuthService.verifyOtp(this.otpCtrl.value);
      console.log(response);
      await this.register();

    } catch(e) {
      await this.pageLoaderService.close();
      this.isSubmitting = false;
      console.log(e);
      this.otpCtrl.setErrors(null);
      this.otpCtrl.setErrors({ invalid: true});
      this.otpConfig.containerClass = 'invalid';
    }
  }

  async register() {
    try{
      const params = this.formData;
      params.mobileNumber = params?.mobileNumber ? params?.mobileNumber?.toString().padStart(11, '0') : '0';
      this.isSubmitting = true;
      await this.pageLoaderService.open('Saving your account please wait...');
      this.authService.register(params)
      .subscribe(async res => {
        if (res.success) {
          await this.presentAlert({
            header: 'Saved!',
            buttons: ['Ok']
          });
          const logRes = await this.authService.login(params).toPromise();

          // this.storageService.saveRefreshToken(logRes.data.accessToken);
          // this.storageService.saveAccessToken(logRes.data.refreshToken);
          // this.storageService.saveTotalUnreadNotif(logRes.data.totalUnreadNotif);
          const userData: Member = logRes.data;
          this.storageService.saveLoginUser(userData);
          localStorage.removeItem('register-draft');
          window.location.href = '/';

          this.isSubmitting = false;
        } else {
          this.isSubmitting = false;
          await this.pageLoaderService.close();
          // await this.verifyNumberModal.dismiss();
          await this.presentAlert({
            header: 'Try again!',
            message: Array.isArray(res.message) ? res.message[0] : res.message,
            buttons:  ['Ok']
          });
        }
      }, async (err) => {
        this.isSubmitting = false;
        await this.pageLoaderService.close();
        // await this.verifyNumberModal.dismiss();
        await this.presentAlert({
          header: 'Try again!',
          message: Array.isArray(err.message) ? err.message[0] : err.message,
          buttons:  ['Ok']
        });
      });

    } catch (e){
      await this.pageLoaderService.close();
      // await this.verifyNumberModal.dismiss();
      this.isSubmitting = false;
      await this.presentAlert({
        header: 'Try again!',
        message: Array.isArray(e.message) ? e.message[0] : e.message,
        buttons:  ['Ok']
      });
    }
  }

  async presentAlert(options: any) {
    const alert = await this.alertController.create(options);
    return await alert.present();
  }

  getError(key: string) {
    return (this.f[key].invalid && this.f[key].dirty) || (this.f[key].touched && this.f[key].dirty)? this.f[key].errors : null;
  }

  async refreshPage() {
    const params = this.formData;
    const data = JSON.stringify(params);
    localStorage.setItem('register-draft', data);
    window.location.reload();
  }
}
