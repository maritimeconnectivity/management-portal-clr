import { Component } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'mp-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  role: string = 'admin';

  constructor(private authService: AuthService) {}

  async logOut() {
    this.authService.logout();
  }
}
