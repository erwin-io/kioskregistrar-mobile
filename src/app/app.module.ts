
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { TokenInterceptor } from './interceptors/token.interceptors';
import { CommonModule } from '@angular/common';
import { NavigationPageModule } from './navigation/navigation.module';
import { MaterialModule } from './material/material.module';
import { PageLoaderModule } from './shared/page-loader/page-loader.module';
import { DirectiveModule } from './shared/directive/directive.module';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { ImageViewerPageModule } from './shared/image-viewer/image-viewer.module';
import { SuperTabsModule } from '@ionic-super-tabs/angular';
import { NgxIonicImageViewerModule } from 'ngx-ionic-image-viewer';
import { provideAuth,getAuth, PhoneAuthProvider } from '@angular/fire/auth';
import { provideFirestore,getFirestore } from '@angular/fire/firestore';
import { provideFirebaseApp } from '@angular/fire/app';
import { initializeApp } from 'firebase/app';
import { environment } from 'src/environments/environment';
import { AppConfigService } from './services/app-config.service';
import { WindowService } from './services/window.service';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { PusherService } from './services/pusher.service';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';



@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    BrowserAnimationsModule,
    CommonModule,
    NavigationPageModule,
    HttpClientModule,
    MaterialModule,
    PageLoaderModule,
    DirectiveModule,
    ImageViewerPageModule,
    SuperTabsModule.forRoot(),
    NgxIonicImageViewerModule,
    NgxExtendedPdfViewerModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore())
  ],
  providers: [
    PusherService,
    InAppBrowser,
    AndroidPermissions,
    LocalNotifications,
    WindowService,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    {
      provide : APP_INITIALIZER,
      multi : true,
      deps : [AppConfigService],
      useFactory : (config: AppConfigService) =>  () => config.loadAppConfig()
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
