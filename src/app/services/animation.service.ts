/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Injectable } from '@angular/core';
import { AnimationController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AnimationService {

  constructor(private animationCtrl: AnimationController) {}

  flyUpAnimation = (baseEl: HTMLElement) => {
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


  };
  leaveFlyUpAnimation = (baseEl: HTMLElement) => this.flyUpAnimation(baseEl).direction('reverse');

  pushLeftAnimation = (baseEl: HTMLElement) => {
    const root = baseEl.shadowRoot;
    const backdropAnimation = this.animationCtrl
      .create()
      .addElement(root.querySelector('ion-backdrop')!)
      .fromTo('opacity', '0.01', '0.8');

      const wrapperAnimation = this.animationCtrl
      .create()
      .addElement(root.querySelector('.modal-wrapper')!)
      .keyframes([
      { offset: 0, transform: 'translateX(100%)', opacity: '0.8' },
      { offset: 1, transform: 'translateX(0)', opacity: '1'  },
      ]);
      return this.animationCtrl
      .create()
      .addElement(baseEl)
      .easing('ease-out')
      .duration(200)
      .addAnimation([backdropAnimation, wrapperAnimation]);


  };
  leavePushLeftAnimation = (baseEl: HTMLElement) => this.pushLeftAnimation(baseEl).direction('reverse');

  pushRightAnimation = (baseEl: HTMLElement) => {
    const root = baseEl.shadowRoot;
    const backdropAnimation = this.animationCtrl
      .create()
      .addElement(root.querySelector('ion-backdrop')!)
      .fromTo('opacity', '0.01', '0.8');

      const wrapperAnimation = this.animationCtrl
      .create()
      .addElement(root.querySelector('.modal-wrapper')!)
      .keyframes([
      { offset: 0, transform: 'translateX(-100%)', opacity: '0.8' },
      { offset: 1, transform: 'translateX(0)', opacity: '1'  },
      ]);
      return this.animationCtrl
      .create()
      .addElement(baseEl)
      .easing('ease-out')
      .duration(200)
      .addAnimation([backdropAnimation, wrapperAnimation]);


  };
  leavePushRightAnimation = (baseEl: HTMLElement) => this.pushRightAnimation(baseEl).direction('reverse');
}
