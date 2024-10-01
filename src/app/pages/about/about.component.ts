import { Component } from '@angular/core';
import { ClrDatagridModule } from '@clr/angular';
import { AppConfig } from 'src/app/app.config';
import { HttpClient } from '@angular/common/http';

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
      console.log(version);
    });
    this.fetchVersionFromSwaggerFile(AppConfig.SR_BASE_PATH + '/v3/api-docs').then(version => {
      this.srVersion = version;
    });
    if (!this.hasServiceRegistry) {
      this.components = this.components.filter(c => c.name !== 'Service Registry');
    }
  }

  

  async fetchVersionFromSwaggerFile(url: string): Promise<string> {
    try {
      const res: any = await this.http.get(url).subscribe();
      
      console.log(res);
      return res?.info?.version || '';
    } catch (error) {
      console.log(error);
      // Handle error here
      return '';
    }
  }

}
