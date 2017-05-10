import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';
import {FlexLayoutModule} from '@angular/flex-layout';

import {AuthGuard} from '../auth/auth.module';

import {AngularFireModule} from 'angularfire2';
import {AngularFireDatabaseModule} from 'angularfire2/database';
import {AngularFireAuthModule} from 'angularfire2/auth';
import {environment} from '../../environments/environment';

import {MessagesComponent} from './messages.component';
import {DataService} from '../common/data.service';
import {MaterialModule} from '../material/material.module';

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
        AngularFireAuthModule
    ],
    providers: [
        DataService
    ]
})

export class MessagesModule {}

export {DataService};
