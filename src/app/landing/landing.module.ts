import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { RouterModule } from '@angular/router';
import { LandingComponent } from './landing.component';
import { LandingRoutingModule } from './landing-routing.module';
import { KeycloakService } from 'keycloak-angular';
import { SharedModule } from '../common/shared/shared.module';

@NgModule({
  declarations: [
    LandingComponent
  ],
  imports: [
    SharedModule,
    RouterModule,
    LandingRoutingModule,
    LoginComponent
  ],
  providers: [
  ]
})
export class LandingModule { }
