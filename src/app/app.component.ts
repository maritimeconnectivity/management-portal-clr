import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet><notifier-container></notifier-container>',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'management-portal-clr';
}
