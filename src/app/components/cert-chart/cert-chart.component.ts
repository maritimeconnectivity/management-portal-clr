import { Component, Input, SimpleChanges } from '@angular/core';
import { Color, LegendPosition, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';
import { Subject } from 'rxjs';
import { DeviceControllerService, PageDevice } from 'src/app/backend-api/identity-registry';
import { ItemType } from 'src/app/common/menuType';

class ChartData{ 
  name: string = '';
  series: { name: any; value: number; }[] = [];
};

@Component({
  selector: 'app-cert-chart',
  standalone: true,
  imports: [NgxChartsModule],
  templateUrl: './cert-chart.component.html',
  styleUrl: './cert-chart.component.css'
})
export class CertChartComponent {
  @Input() certificates: any[] = [];

  single: any[] = [];

  // options
  showXAxis: boolean = true;
  showYAxis: boolean = true;
  gradient: boolean = false;
  showLegend: boolean = true;
  view: [number, number] = [600, 1000];
  data: ChartData[] = [];
  // options
  legendPosition: LegendPosition = LegendPosition.Below;
  showXAxisLabel: boolean = true;
  yAxisLabel: string = 'Certificates';
  showYAxisLabel: boolean = true;
  xAxisLabel = 'Valid days left';

  colorScheme: Color | string = {
    name: 'default',
    selectable: true,
    group: ScaleType.Time,
    domain: ['#E44D25', '#F0803C', '#D9E68B', '#5AA454']
  };
  schemeType: ScaleType = ScaleType.Linear;

  constructor() {
  }

  onSelect(data: any): void {
    console.log('Item clicked', JSON.parse(JSON.stringify(data)));
  }

  onActivate(data: any): void {
    console.log('Activate', JSON.parse(JSON.stringify(data)));
  }

  onDeactivate(data: any): void {
    console.log('Deactivate', JSON.parse(JSON.stringify(data)));
  }

  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    this.certificates = changes['certificates'].currentValue;
    
    const today = new Date();
    /*
    this.certificates.forEach((cert: any) => {
      var found = this.multi.filter((data) => data.name === cert.mrn);
      const endDate = new Date(cert.end);
      const timeDiff = endDate.getTime() - today.getTime();
      const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
      if (daysLeft < 0) {
        return;
      }
      if (found.length === 0) {
        this.multi = [...this.multi, { name: cert.mrn, series: [{ name: cert.serialNumber, value: daysLeft }] }];
      } else {
        found[0].series = [...found[0].series, { name: cert.serialNumber, value: daysLeft }];
      }
    });
    */
   this.single = this.certificates.map((cert: any) => {
    const endDate = new Date(cert.end);
      const timeDiff = endDate.getTime() - today.getTime();
      const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
      if (daysLeft < 0) {
        return undefined;
      }
      return ({ name: cert.mrn + "|" + cert.serialNumber, value: daysLeft })}).filter((cert) => cert !== undefined);
    this.view = [600, 60 + this.single.length * 40];
  }
}
