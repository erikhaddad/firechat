import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {
    MdButtonModule,
    MdCardModule,
    MdCheckboxModule,
    MdIconModule,
    MdInputModule,
    MdSidenavModule, MdTabsModule,
    MdToolbarModule,
    MdTooltipModule
} from '@angular/material';

@NgModule({
    imports: [
        CommonModule,
        MdButtonModule,
        MdCardModule,
        MdCheckboxModule,
        MdIconModule,
        MdInputModule,
        MdSidenavModule,
        MdTabsModule,
        MdToolbarModule,
        MdTooltipModule
    ],
    exports: [
        MdButtonModule,
        MdCardModule,
        MdCheckboxModule,
        MdIconModule,
        MdInputModule,
        MdSidenavModule,
        MdTabsModule,
        MdToolbarModule,
        MdTooltipModule
    ],
    declarations: []
})
export class MaterialModule {}
