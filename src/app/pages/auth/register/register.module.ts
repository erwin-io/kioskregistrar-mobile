import { MaterialModule } from './../../../material/material.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RegisterPageRoutingModule } from './register-routing.module';

import { RegisterPage } from './register.page';
import { DirectiveModule } from 'src/app/shared/directive/directive.module';
import { PipeModule } from 'src/app/shared/pipe/pipe.module';
import { NgOtpInputModule } from  'ng-otp-input';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RegisterPageRoutingModule,
    MaterialModule,
    DirectiveModule,
    PipeModule,
    NgOtpInputModule,
  ],
  declarations: [RegisterPage],
  providers: []
})
export class RegisterPageModule {}
