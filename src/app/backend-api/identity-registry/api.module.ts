import { NgModule, ModuleWithProviders, SkipSelf, Optional } from '@angular/core';
import { Configuration } from './configuration';
import { HttpClient } from '@angular/common/http';


import { AgentControllerService } from './api/agentController.service';
import { CertificateControllerService } from './api/certificateController.service';
import { DeviceControllerService } from './api/deviceController.service';
import { LogoControllerService } from './api/logoController.service';
import { MmsControllerService } from './api/mmsController.service';
import { OrganizationControllerService } from './api/organizationController.service';
import { RoleControllerService } from './api/roleController.service';
import { SecomControllerService } from './api/secomController.service';
import { ServiceControllerService } from './api/serviceController.service';
import { UserControllerService } from './api/userController.service';
import { VesselControllerService } from './api/vesselController.service';
import { VesselImageControllerService } from './api/vesselImageController.service';

@NgModule({
  imports:      [],
  declarations: [],
  exports:      [],
  providers: [
    AgentControllerService,
    CertificateControllerService,
    DeviceControllerService,
    LogoControllerService,
    MmsControllerService,
    OrganizationControllerService,
    RoleControllerService,
    SecomControllerService,
    ServiceControllerService,
    UserControllerService,
    VesselControllerService,
    VesselImageControllerService ]
})
export class ApiModule {
    public static forRoot(configurationFactory: () => Configuration): ModuleWithProviders<ApiModule> {
        return {
            ngModule: ApiModule,
            providers: [ { provide: Configuration, useFactory: configurationFactory } ]
        };
    }

    constructor( @Optional() @SkipSelf() parentModule: ApiModule,
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
