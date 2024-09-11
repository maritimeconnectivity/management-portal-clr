import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-pages',
  standalone: true,
  imports: [RouterModule],
  template: '<router-outlet></router-outlet>',
  styleUrl: './pages.component.css'
})
export class PagesComponent {

}
