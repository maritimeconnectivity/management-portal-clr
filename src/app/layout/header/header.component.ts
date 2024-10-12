import { Component } from '@angular/core';
import { ClarityIcons, crownIcon } from '@cds/core/icon';
import { AuthService } from 'src/app/auth/auth.service';
ClarityIcons.addIcons(crownIcon);

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
