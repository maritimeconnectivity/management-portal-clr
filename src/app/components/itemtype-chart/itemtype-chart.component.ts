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

import { Component, Input, SimpleChanges, OnChanges } from '@angular/core';

@Component({
  selector: 'app-itemtype-chart',
  standalone: true,
  imports: [],
  templateUrl: './itemtype-chart.component.html',
  styleUrl: './itemtype-chart.component.css'
})
export class ItemtypeChartComponent implements OnChanges {
  @Input() itemType = '';
  @Input() items: any[] = [];
  @Input() numberOfActive = 0;
  @Input() numberOfRevoked = 0;
  @Input() numberOfExpired = 0;
  numberOfItems = 0;

  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    if(changes['items'].currentValue) {
      this.numberOfItems = changes['items'].currentValue.length;
    }
  }
}
