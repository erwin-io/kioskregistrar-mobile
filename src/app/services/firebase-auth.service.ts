import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { IServices } from './interface/iservices';
import { Auth, RecaptchaVerifier, signInWithPhoneNumber, onAuthStateChanged } from '@angular/fire/auth';
import { WindowService } from './window.service';

@Injectable({
  providedIn: 'root'
})
export class FirebaseAuthService implements IServices {

  appVerifier: any;
  confirmationResult: any;

  constructor(
    private _fireAuth: Auth,
    
  ) { }

  recaptcha() {
    // if (this.appVerifier && ('clear' in this.appVerifier)) {
    //   console.log('Clearing recaptcha');
    //   this.appVerifier.clear();
    //   document.getElementById('recaptcha-container').innerHTML = '<div id=\'sign-in-button\'></div>';
    // }
    this.appVerifier = new RecaptchaVerifier('recaptcha-container', {
      size: 'invisible',
      callback: (response) => {
        console.log(response);
      },
      'expired-callback': () => {}
    }, this._fireAuth);
  }

  async signInWithPhoneNumber(phoneNumber) {
    try {
      if(!this.appVerifier) this.recaptcha();
      console.log(this.appVerifier);
      const confirmationResult = await signInWithPhoneNumber(this._fireAuth, phoneNumber, this.appVerifier);
      console.log(this.appVerifier);
      this.confirmationResult = confirmationResult;
      return confirmationResult;
    } catch(e) {
      throw(e);
    }
  }

  async verifyOtp(otp) {
    try {
      if(!this.appVerifier) this.recaptcha();
      return await this.confirmationResult.confirm(otp);
    } catch(e) {
      throw(e);
    }
  }

  handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      this.log(`${operation} failed: ${Array.isArray(error.error.message) ? error.error.message[0] : error.error.message}`);
      return of(error.error as T);
    };
  }

  log(message: string) {
    console.log(message);
  }
}
