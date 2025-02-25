/*
 * Copyright (c) 2025 Maritime Connectivity Platform Consortium
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component, Input, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
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
  @Input() itemType: string = ItemType.None.toString();
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
  backgroundColors: any[] = [];

  colorScheme: Color | string = {
    name: 'default',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: this.backgroundColors,
  };
  schemeType: ScaleType = ScaleType.Linear;

  constructor(private router: Router) {
  }

  onSelect(data: any): void {
    const urlTree = this.router.createUrlTree(['/pages/ir/' + this.itemType + '/' + data.name.split(' | ')[0]], {
      queryParams: { serial: data.name.split(' | ')[1]}
    });
    this.router.navigateByUrl(urlTree);
  }

  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    this.certificates = changes['certificates'].currentValue;
    
    const today = new Date();
   this.single = this.certificates.map((cert: any) => {
    const endDate = new Date(cert.end);
      const timeDiff = endDate.getTime() - today.getTime();
      const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
      if (daysLeft < 0) {
        return undefined;
      }
      return ({ name: cert.mrn + " | " + cert.serialNumber, value: daysLeft, label: cert.mrn, type: this.itemType })}).filter((cert) => cert !== undefined);
    this.view = [600, 60 + this.single.length * 40];
    this.single.forEach((cert) => {
      if(cert.value < 60) {
        this.backgroundColors.push('#A10A28');
      } else if(cert.value < 120) {
        this.backgroundColors.push('#E44D25');
      } else if(cert.value < 240) {
        this.backgroundColors.push('#5AA454');
      } else {
        this.backgroundColors.push('#0B6623');
      }
    });
  }
}
