import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { ProcessDialogComponent } from './process-dialog/process-dialog.component';
import { RegisterDialogComponent } from './register-dialog/register-dialog.component';
import { RouterModule } from '@angular/router';
import { LandingComponent } from './landing.component';
import { LandingRoutingModule } from './landing-routing.module';

@NgModule({
  declarations: [
    LandingComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    LandingRoutingModule,
    LoginComponent,
    ProcessDialogComponent,
    RegisterDialogComponent
  ]
})
export class LandingModule { }
