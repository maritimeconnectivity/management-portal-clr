import {APP_INITIALIZER, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {ClarityModule} from "@clr/angular";
import {ApiModule as MIRApiModule} from './backend-api/identity-registry';
import {ApiModule as MSRApiModule} from './backend-api/service-registry';
import {ApiModule as SECOMApiModule} from './backend-api/secom';
import {initializeKeycloak} from './auth/auth.init';
import {KeycloakService} from 'keycloak-angular';

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        ClarityModule,
        MIRApiModule,
        MSRApiModule,
        SECOMApiModule
    ],
    providers: [
        {
            provide: APP_INITIALIZER,
            useFactory: initializeKeycloak,
            multi: true,
            deps: [KeycloakService]
        },
        KeycloakService
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
