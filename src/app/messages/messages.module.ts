import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';
import {FlexLayoutModule} from '@angular/flex-layout';

import {AuthGuard} from '../auth/auth.guard';

import {AngularFireModule} from 'angularfire2';
import {AngularFireDatabaseModule} from 'angularfire2/database';
import {AngularFirestoreModule} from 'angularfire2/firestore';
import {AngularFireAuthModule} from 'angularfire2/auth';
import {environment} from '../../environments/environment';

import {MessagesComponent} from './messages.component';
import {RtdbService} from '../common/rtdb.service';
import {MaterialModule} from '../common/material.module';
import {FirestoreService} from '../common/firestore.service';
import {AngularFireStorageModule} from 'angularfire2/storage';

const routes: Routes = [
  {path: 'messages/room/:roomId', component: MessagesComponent, canActivate: [AuthGuard]},
  {path: 'messages', component: MessagesComponent, canActivate: [AuthGuard]},
  {path: '', redirectTo: '/messages', pathMatch: 'full'}
];

@NgModule({
  declarations: [
    MessagesComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),

    FlexLayoutModule,
    MaterialModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    AngularFirestoreModule,
    AngularFireAuthModule,
    AngularFireStorageModule
  ],
  providers: [
    RtdbService, FirestoreService
  ]
})

export class MessagesModule {
}

export {RtdbService, FirestoreService};
