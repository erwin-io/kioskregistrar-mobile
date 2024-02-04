import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RequestPageRoutingModule } from './request-routing.module';

import { RequestPage } from './request.page';
import { MaterialModule } from '../../material/material.module';
import { PipeModule } from 'src/app/shared/pipe/pipe.module';
import{ SuperTabsModule } from '@ionic-super-tabs/angular';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RequestPageRoutingModule,
    MaterialModule,
    PipeModule,
    SuperTabsModule,
  ],
  declarations: [RequestPage]
})
export class RequestPageModule {}
