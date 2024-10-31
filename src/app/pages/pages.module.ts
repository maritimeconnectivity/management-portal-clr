import { NgModule } from '@angular/core';
import { LayoutModule } from '../layout/layout.module';
import { RouterModule } from '@angular/router';
import { ClarityModule } from '@clr/angular';
import { PagesComponent } from './pages.component';
import { PagesRoutingModule } from './pages-routing.module';
import { SharedModule } from '../common/shared/shared.module';



@NgModule({
  declarations: [
  ],
  imports: [
    SharedModule,
    LayoutModule,
    RouterModule,
    ClarityModule,
    PagesRoutingModule,
    PagesComponent
  ]
})
export class PagesModule { }
