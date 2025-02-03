import { Component, SimpleChanges } from '@angular/core';
import { ClrDatagridModule } from '@clr/angular';
import { AppConfig } from 'src/app/app.config';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Configuration } from 'src/app/backend-api/identity-registry';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [
    ClrDatagridModule
  ],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {
  hasServiceRegistry = AppConfig.HAS_SERVICE_REGISTRY;
  environmentName = AppConfig.ENVIRONMENT_NAME;
  irVersion = '';
  srVersion = ''; 

  public defaultHeaders = new HttpHeaders();
  public configuration = new Configuration();

  components= [{
    name: "Identity Registry",
    version: this.irVersion,
    provider: AppConfig.IR_PROVIDER,
    contact: AppConfig.IR_CONTACT,
  },
  {
    name: "Service Registry",
    version: this.srVersion,
    provider: AppConfig.SR_PROVIDER,
    contact: AppConfig.SR_CONTACT
  },
  {
    name: "Management Portal",
    version: AppConfig.MP_VERSION,
    provider: AppConfig.MP_PROVIDER,
    contact: AppConfig.MP_CONTACT
  }
  ];

  constructor(private http: HttpClient) {
    this.fetchVersionFromSwaggerFile(AppConfig.IR_BASE_PATH + '/v3/api-docs').then(version => {
      this.irVersion = version;
    });
    if (!this.hasServiceRegistry) {
      this.components = this.components.filter(c => c.name !== 'Service Registry');
    } else {
      this.fetchVersionFromSwaggerFile(AppConfig.SR_BASE_PATH + '/v3/api-docs').then(version => {
        this.srVersion = version;
        this.updateSrVersion();
      });
    }
  }

  updateSrVersion() {
    this.components = this.components.map(c => {
      if (c.name === 'Service Registry') {
        c.version = this.srVersion;
      }
      return c;
    });
  }  

  async fetchVersionFromSwaggerFile(url: string): Promise<string> {

  let headers = this.defaultHeaders;

  // to determine the Accept header
  let httpHeaderAccepts: string[] = [
      '*/*'
  ];
  const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
  if (httpHeaderAcceptSelected != undefined) {
      headers = headers.set('Accept', httpHeaderAcceptSelected);
  }

  return new Promise<string>((resolve, reject) => {
    this.http.request<any>('get', url,
      {
        withCredentials: this.configuration.withCredentials,
        headers: headers,
      }
    ).subscribe((res: any) => {
      resolve(res.info.version ? res.info.version : 'Unknown');
    }, (error: any) => {
      reject('Unknown');
    });
  });
  }

}
