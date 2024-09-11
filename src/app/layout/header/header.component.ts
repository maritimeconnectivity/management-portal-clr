import { Component } from '@angular/core';

@Component({
  selector: 'mp-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  role: string = 'admin';
}
