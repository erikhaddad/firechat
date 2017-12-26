import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {MaterialModule} from '../common/material.module';

import {SignInComponent} from '../sign-in/sign-in.component';
import {AuthGuard} from './auth.guard';
import {UnauthGuard} from './unauth.guard';
import {AuthService} from './auth.service';

/*
const routes: Routes = [
    {path: '', component: SignInComponent, canActivate: [UnauthGuard]}
];
*/

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MaterialModule
  ],
  providers: [
    AuthGuard,
    AuthService,
    UnauthGuard
  ]
})

export class AuthModule {}

/*
export {AuthGuard};
export {AuthService};
export {UnauthGuard};
*/

