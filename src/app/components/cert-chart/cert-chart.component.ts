import { Component, Input, SimpleChanges } from '@angular/core';
import { DeviceControllerService, PageDevice } from 'src/app/backend-api/identity-registry';
import { ItemType } from 'src/app/common/menuType';

@Component({
  selector: 'app-cert-chart',
  standalone: true,
  imports: [],
  templateUrl: './cert-chart.component.html',
  styleUrl: './cert-chart.component.css'
})
export class CertChartComponent {
  @Input() certificates: any[] = [];


  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    this.certificates = changes['certificates'].currentValue;
  }
}
