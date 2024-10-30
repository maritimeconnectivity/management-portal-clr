import { Component, Input, SimpleChanges } from '@angular/core';
import { Color, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';
import { DeviceControllerService, PageDevice } from 'src/app/backend-api/identity-registry';
import { ItemType } from 'src/app/common/menuType';

@Component({
  selector: 'app-cert-chart',
  standalone: true,
  imports: [NgxChartsModule],
  templateUrl: './cert-chart.component.html',
  styleUrl: './cert-chart.component.css'
})
export class CertChartComponent {
  @Input() certificates: any[] = [];

  multi: any[] = [];
  view: [number, number] = [700, 300];

  // options
  legend: boolean = true;
  showLabels: boolean = true;
  animations: boolean = true;
  xAxis: boolean = true;
  yAxis: boolean = true;
  showYAxisLabel: boolean = true;
  showXAxisLabel: boolean = true;
  xAxisLabel: string = 'Year';
  yAxisLabel: string = 'Validity period';
  timeline: boolean = true;

  colorScheme: Color = {
    name: 'default',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5']
  };

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
  }
}
