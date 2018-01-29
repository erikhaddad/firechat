import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MaterialModule} from './common/material.module';

import {AppComponent} from './app.component';
import {AuthModule} from './auth/auth.module';
import {SignInModule} from './sign-in/sign-in.module';
import {MessagesModule} from './messages/messages.module';
import {RouterModule, Routes} from '@angular/router';
import {RoomMetadataComponent} from './room-metadata/room-metadata.component';
import {HttpClientModule} from '@angular/common/http';
import {AppStateService} from './common/app-state.service';
import {RtdbService} from './common/rtdb.service';
import {FirestoreService} from './common/firestore.service';
import {ServiceWorkerModule} from '@angular/service-worker';
import {environment} from '../environments/environment';
import {HomeModule} from './home/home.module';
import {LayoutService} from './common/layout.service';
import {MessagingService} from './common/messaging.service';
import {ReferenceService} from './common/reference.service';

const routes: Routes = [
  // { path: '', redirectTo: '/messages', pathMatch: 'full'}
];

@NgModule({
  declarations: [
    AppComponent,
    RoomMetadataComponent
  ],
  exports: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    HttpClientModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(routes, {useHash: false}),
    // THIS WON'T WORK DUE TO A CURRENT CONFLICT WITH ANGULARFIRE2!!!!
    // environment.production ? ServiceWorkerModule.register('/ngsw-worker.js') : [],
    ServiceWorkerModule.register('/ngsw-worker.js', {
      enabled: environment.production
    }),
    FlexLayoutModule,
    MaterialModule,

    AuthModule,
    HomeModule,
    SignInModule,
    MessagesModule,
    ServiceWorkerModule
  ],
  entryComponents: [RoomMetadataComponent],
  providers: [
    AppStateService,
    RtdbService,
    FirestoreService,
    LayoutService,
    MessagingService,
    ReferenceService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
