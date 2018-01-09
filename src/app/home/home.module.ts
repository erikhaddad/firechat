import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HomeComponent} from './home.component';
import {RouterModule} from '@angular/router';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MaterialModule} from '../common/material.module';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild([
            {path: 'home', component: HomeComponent},
            {path: '', pathMatch: 'full', component: HomeComponent}
        ]),
        FlexLayoutModule,
        MaterialModule
    ],
    declarations: [HomeComponent]
})
export class HomeModule {
}
