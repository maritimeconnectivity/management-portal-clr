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
import {KeycloakAngularModule, KeycloakService} from 'keycloak-angular';
import {HttpClient, provideHttpClient, withInterceptorsFromDi} from "@angular/common/http";
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { NotifierModule } from 'gramli-angular-notifier';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http);
}

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        NotifierModule,
        ClarityModule,
        MIRApiModule,
        MSRApiModule,
        SECOMApiModule,
        KeycloakAngularModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        })
    ],
    providers: [
        {
            provide: APP_INITIALIZER,
            useFactory: initializeKeycloak,
            multi: true,
            deps: [KeycloakService]
        },
        provideHttpClient(withInterceptorsFromDi())
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
