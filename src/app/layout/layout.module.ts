import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClarityModule } from '@clr/angular';
import { HeaderComponent } from './header/header.component';
import { LayoutComponent } from './layout/layout.component';
import { MainComponent } from './main/main.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import {RouterLink, RouterLinkActive} from "@angular/router";
import { SharedModule } from '../common/shared/shared.module';

@NgModule({
  declarations: [
    SidebarComponent,
    HeaderComponent,
    MainComponent,
    LayoutComponent
  ],
  imports: [
    SharedModule,
    ClarityModule,
    RouterLink,
    RouterLinkActive,
  ],
  exports: [
    LayoutComponent
  ]
})
export class LayoutModule { }
