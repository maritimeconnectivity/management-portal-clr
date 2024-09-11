import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from '../layout/layout/layout.component';
import { LayoutModule } from '../layout/layout.module';
import { RouterModule } from '@angular/router';
import { ClarityModule } from '@clr/angular';
import { PagesComponent } from './pages.component';
import { PagesRoutingModule } from './pages-routing.module';



@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    LayoutModule,
    RouterModule,
    ClarityModule,
    PagesRoutingModule,
    PagesComponent
  ]
})
export class PagesModule { }
