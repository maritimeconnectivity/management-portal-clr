import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ClarityIcons, crownIcon, sunIcon, moonIcon } from '@cds/core/icon';
import { ClrInput } from '@clr/angular';
import { AuthService } from 'src/app/auth/auth.service';
import { loadTheme, storeTheme } from 'src/app/common/themeHelper';
ClarityIcons.addIcons(crownIcon, sunIcon, moonIcon);

@Component({
  selector: 'mp-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  role:string = 'admin';
  userName: string = 'admin';
  theme = 'light';
  test= false;
  myMrn = '';

  constructor(private authService: AuthService,
    private router: Router
  ) {
    this.authService.getUserName().then((userName) => {
      this.userName = userName;
    });
    this.authService.getUserMrn().then((myMrn) => {
      this.myMrn = myMrn;
    });
    this.theme = loadTheme();
    this.test = this.theme === 'dark';
    document.body.setAttribute('cds-theme', this.theme);
  }

  async logOut() {
    this.authService.logout();
  }

  goHome() {
    this.router.navigateByUrl('/pages');
  }

  goMyPage() {
    this.router.navigateByUrl('/pages/ir/user/'+this.myMrn);
  }

  toggleTheme() {
    this.theme =  this.theme === 'light' ? 'dark' : 'light';
    document.body.setAttribute('cds-theme', this.theme);
    storeTheme(this.theme);
    this.test = this.theme === 'dark';
  }
}
