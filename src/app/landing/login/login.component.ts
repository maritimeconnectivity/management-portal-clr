import { Component, Injectable } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { AuthService } from 'src/app/auth/auth.service';
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-login',
  standalone: true,
    imports: [
        NgIf
    ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent {

  loggedIn = false;

  constructor(private authService: AuthService) {}
  
  ngOnInit(): void {
    this.updateLoggedIn();
  }

  updateLoggedIn() {
    this.authService.isAuthenticated().then(loggedIn => {
      this.loggedIn = loggedIn;
    });
  }

  async logIn() {
    this.authService.login();
    this.updateLoggedIn();
  }

  async logOut() {
    this.authService.logout();
    this.updateLoggedIn();
  }
}
