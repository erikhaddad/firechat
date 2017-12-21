import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MaterialModule} from './material/material.module';

import {AppComponent} from './app.component';
import {AuthModule} from './auth/auth.module';
import {SignInModule} from './sign-in/sign-in.module';
import {MessagesModule} from './messages/messages.module';
import {DataService} from './common/data.service';
import {RouterModule, Routes} from '@angular/router';
import {RoomMetadataComponent} from './room-metadata/room-metadata.component';
import {HttpClientModule} from '@angular/common/http';

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

        FlexLayoutModule,
        MaterialModule,

        AuthModule,
        SignInModule,
        MessagesModule
    ],
    entryComponents: [RoomMetadataComponent],
    providers: [DataService],
    bootstrap: [AppComponent]
})
export class AppModule {}
