import {APP_INITIALIZER, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {ClarityModule} from "@clr/angular";
import {BASE_PATH as IR_BASE_PATH, ApiModule as MIRApiModule} from './backend-api/identity-registry';
import {BASE_PATH as SR_BASE_PATH, ApiModule as MSRApiModule} from './backend-api/service-registry';
import {BASE_PATH as SECOM_BASE_PATH, ApiModule as SECOMApiModule} from './backend-api/secom';
import {initializeKeycloak} from './auth/auth.init';
import {KeycloakAngularModule, KeycloakService} from 'keycloak-angular';
import {HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withInterceptorsFromDi} from "@angular/common/http";
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { NotifierModule } from 'gramli-angular-notifier';
import { AppConfig } from './app.config';
import { AuthInterceptor } from './auth/auth.interceptor';

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
        {   provide: IR_BASE_PATH, useValue: AppConfig.IR_BASE_PATH },
        {   provide: SR_BASE_PATH, useValue: AppConfig.SR_BASE_PATH },
        {   provide: SECOM_BASE_PATH, useValue: AppConfig.SR_BASE_PATH },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true
        },
        provideHttpClient(withInterceptorsFromDi())
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
