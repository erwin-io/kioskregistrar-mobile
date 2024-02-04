import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RequestDetailsPageRoutingModule } from './request-details-routing.module';

import { RequestDetailsPage } from './request-details.page';
import { MaterialModule } from 'src/app/material/material.module';
import { DirectiveModule } from 'src/app/shared/directive/directive.module';
import { PipeModule } from 'src/app/shared/pipe/pipe.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RequestDetailsPageRoutingModule,
    MaterialModule,
    DirectiveModule,
    PipeModule,
  ],
  declarations: [RequestDetailsPage]
})
export class RequestDetailsPageModule {}
