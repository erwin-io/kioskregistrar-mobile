import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RequestPage } from './request.page';

const routes: Routes = [
  {
    path: '',
    component: RequestPage
  },
  {
    path: 'request-details',
    loadChildren: () => import('./request-details/request-details.module').then( m => m.RequestDetailsPageModule)
  },
  {
    path: 'request-history',
    loadChildren: () => import('./request-history/request-history.module').then( m => m.RequestHistoryPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RequestPageRoutingModule {}
