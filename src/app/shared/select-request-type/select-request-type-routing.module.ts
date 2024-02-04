import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SelectRequestTypePage } from './select-request-type.page';

const routes: Routes = [
  {
    path: '',
    component: SelectRequestTypePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SelectRequestTypePageRoutingModule {}
