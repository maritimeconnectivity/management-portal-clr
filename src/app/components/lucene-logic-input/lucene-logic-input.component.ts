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

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClarityModule } from '@clr/angular';
import { LogicalOperator } from 'src/app/common/lucene-query/localOperator';
const shortid = require('shortid');

@Component({
  selector: 'app-lucene-logic-input',
  standalone: true,
  imports: [
    ClarityModule,
    FormsModule
  ],
  templateUrl: './lucene-logic-input.component.html',
  styleUrl: './lucene-logic-input.component.css'
})
export class LuceneLogicInputComponent {
  @Input() id = '';
  @Input() data: { id: string, [key: string]: any } = {id: '', operator: LogicalOperator.And};
  @Output() updateEvent = new EventEmitter<any>();
  @Output() deleteEvent = new EventEmitter<any>();

  constructor() {
    this.id = shortid.generate();
    this.data = {id: this.id, operator: LogicalOperator.And};
  }
  onSelectionChange(event: any): void {
    this.data = {id: this.id, operator: event};
    this.updateEvent.emit({id: this.id, data: this.data});
  }

  loadComponent(): void {
  }
}
