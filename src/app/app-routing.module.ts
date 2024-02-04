import { NavigationPage } from './navigation/navigation.page';
import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guard/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: NavigationPage,
    children: [
      {
        path: 'home',
        loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'request',
        loadChildren: () => import('./pages/request/request.module').then( m => m.RequestPageModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'notification',
        loadChildren: () => import('./pages/notification/notification.module').then( m => m.NotificationPageModule),
        canActivate: [AuthGuard]
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/auth/login/login.module').then( m => m.LoginPageModule),
    data: {
      auth: true
    }
  },
  {
    path: 'signup',
    loadChildren: () => import('./pages/auth/register/register.module').then( m => m.RegisterPageModule),
    data: {
      auth: true
    }
  },
  {
    path: 'settings',
    loadChildren: () => import('./pages/settings/settings.module').then( m => m.SettingsPageModule)
  },
  {
    path: 'landing-page',
    loadChildren: () => import('./pages/landing-page/landing-page.module').then( m => m.LandingPagePageModule)
  },  {
    path: 'pdf-viewer',
    loadChildren: () => import('./shared/pdf-viewer/pdf-viewer.module').then( m => m.PdfViewerPageModule)
  },
  {
    path: 'select-request-type',
    loadChildren: () => import('./shared/select-request-type/select-request-type.module').then( m => m.SelectRequestTypePageModule)
  },



];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})

export class AppRoutingModule { }
