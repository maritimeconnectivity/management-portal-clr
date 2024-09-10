import { Component } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  constructor(private keycloakService: KeycloakService) {}
  
  logIn() {
    console.log("Test");
    this.keycloakService.login();
  }
}
