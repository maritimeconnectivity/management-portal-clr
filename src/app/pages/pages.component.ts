import { Component } from '@angular/core';
import { LayoutModule } from '../layout/layout.module';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'mp-pages',
  standalone: true,
  imports: [LayoutModule, RouterModule],
  template: '<mp-layout><router-outlet></router-outlet></mp-layout>',
})
export class PagesComponent {

}
