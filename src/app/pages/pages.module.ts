import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from '../layout/layout/layout.component';
import { LayoutModule } from '../layout/layout.module';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    LayoutModule,
    RouterModule
  ]
})
export class PagesModule { }
