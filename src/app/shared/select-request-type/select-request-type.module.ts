import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SelectRequestTypePageRoutingModule } from './select-request-type-routing.module';

import { SelectRequestTypePage } from './select-request-type.page';
import { MaterialModule } from 'src/app/material/material.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    MaterialModule,
    SelectRequestTypePageRoutingModule
  ],
  declarations: [SelectRequestTypePage]
})
export class SelectRequestTypePageModule {}
