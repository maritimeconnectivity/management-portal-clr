import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClarityModule } from '@clr/angular';
import { HeaderComponent } from './header/header.component';
import { LayoutComponent } from './layout/layout.component';
import { MainComponent } from './main/main.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import {RouterLink, RouterLinkActive} from "@angular/router";


@NgModule({
  declarations: [
    SidebarComponent,
    HeaderComponent,
    MainComponent,
    LayoutComponent
  ],
  imports: [
    CommonModule,
    ClarityModule,
    RouterLink,
    RouterLinkActive
  ],
  exports: [
    LayoutComponent
  ]
})
export class LayoutModule { }
