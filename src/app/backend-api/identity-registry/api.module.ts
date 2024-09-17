import {ModuleWithProviders, NgModule, Optional, SkipSelf} from '@angular/core';
import {Configuration} from './configuration';
import {HttpClient} from '@angular/common/http';


import {AgentControllerService} from './api/agentController.service';
import {CertificateControllerService} from './api/certificateController.service';
import {DeviceControllerService} from './api/deviceController.service';
import {LogoControllerService} from './api/logoController.service';
import {MmsControllerService} from './api/mmsController.service';
import {OrganizationControllerService} from './api/organizationController.service';
import {RoleControllerService} from './api/roleController.service';
import {ServiceControllerService} from './api/serviceController.service';
import {UserControllerService} from './api/userController.service';
import {VesselControllerService} from './api/vesselController.service';
import {VesselImageControllerService} from './api/vesselImageController.service';
import {AppConfig} from "../../app.config";

@NgModule({
    imports: [],
    declarations: [],
    exports: [],
    providers: [
        AgentControllerService,
        CertificateControllerService,
        DeviceControllerService,
        LogoControllerService,
        MmsControllerService,
        {
            provide: OrganizationControllerService,
            useFactory: (http: HttpClient) => {
                return new OrganizationControllerService(http, AppConfig.IR_BASE_PATH, new Configuration());
            },
            deps: [HttpClient]
        },
        RoleControllerService,
        ServiceControllerService,
        UserControllerService,
        VesselControllerService,
        VesselImageControllerService]
})
export class ApiModule {
    public static forRoot(configurationFactory: () => Configuration): ModuleWithProviders<ApiModule> {
        return {
            ngModule: ApiModule,
            providers: [{provide: Configuration, useFactory: configurationFactory}]
        };
    }

    constructor(@Optional() @SkipSelf() parentModule: ApiModule,
                @Optional() http: HttpClient) {
        if (parentModule) {
            throw new Error('ApiModule is already loaded. Import in your base AppModule only.');
        }
        if (!http) {
            throw new Error('You need to import the HttpClientModule in your AppModule! \n' +
                'See also https://github.com/angular/angular/issues/20575');
        }
    }
}
