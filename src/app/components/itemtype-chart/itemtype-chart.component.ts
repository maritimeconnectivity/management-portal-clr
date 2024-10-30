import { Component, Input, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-itemtype-chart',
  standalone: true,
  imports: [],
  templateUrl: './itemtype-chart.component.html',
  styleUrl: './itemtype-chart.component.css'
})
export class ItemtypeChartComponent {
  @Input() itemType: string = '';
  @Input() items: any[] = [];
  @Input() numberOfActive: number = 0;
  @Input() numberOfRevoked: number = 0;
  @Input() numberOfExpired: number = 0;
  numberOfItems: number = 0;

  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    if(changes['items'].currentValue) {
      this.numberOfItems = changes['items'].currentValue.length;
    }
  }
}
