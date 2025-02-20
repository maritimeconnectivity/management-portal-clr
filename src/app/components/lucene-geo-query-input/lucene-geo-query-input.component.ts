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

import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClarityIcons, worldIcon } from '@cds/core/icon';
import { ClarityModule } from '@clr/angular';
import { LuceneComponent, Term } from 'src/app/common/lucene-query/lucene-component';
import { QueryFieldInfo } from 'src/app/common/lucene-query/queryFieldInfo';
ClarityIcons.addIcons(worldIcon)
@Component({
  selector: 'app-lucene-geo-query-input',
  standalone: true,
  imports: [
    ClarityModule,
    FormsModule,
    CommonModule
  ],
  templateUrl: './lucene-geo-query-input.component.html',
  styleUrl: './lucene-geo-query-input.component.css'
})
export class LuceneGeoQueryInputComponent implements OnInit, LuceneComponent{
  @Input() id: string = '';
  @Input() data: { id: string, [key: string]: any } = { id: ''};
  fieldInfo?: QueryFieldInfo[] | undefined;
  @Output() updateEvent = new EventEmitter<any>();
  @Output() deleteEvent = new EventEmitter<any>();
  @Output() extendEvent = new EventEmitter<any>();

  constructor() {
    this.id = 'geo';
  }

  ngOnInit(): void {

  }

}
