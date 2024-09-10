import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingComponent } from './landing.component';
import { LoginComponent } from './login/login.component';

const routes: Routes = [{
  path: '',
  component: LandingComponent,
  children: [
    {
      path: 'login',
      component: LoginComponent,
    },
    { path: '', redirectTo: 'login', pathMatch: 'full' },
  ],
}];

/**
 * a router component for landing module
 */
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LandingRoutingModule { }
