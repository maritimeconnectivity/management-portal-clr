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
import { Component, ComponentFactoryResolver, EventEmitter, Input, OnInit, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClarityModule } from '@clr/angular';
import { LuceneSingleQueryInputComponent } from "../lucene-single-query-input/lucene-single-query-input.component";
import { LuceneLogicInputComponent } from "../lucene-logic-input/lucene-logic-input.component";
import { LuceneComponent, Term } from 'src/app/common/lucene-query/lucene-component';
import { QueryFieldInfo } from 'src/app/common/lucene-query/queryFieldInfo';
import { LuceneComponentItem } from 'src/app/common/lucene-query/lucene-component-item';
const shortid = require('shortid');

@Component({
  selector: 'app-lucene-term-input',
  standalone: true,
  imports: [
    ClarityModule,
    FormsModule,
    CommonModule,
],
  templateUrl: './lucene-term-input.component.html',
  styleUrl: './lucene-term-input.component.css'
})
export class LuceneTermInputComponent implements LuceneComponent {
  group: LuceneComponentItem[] = [];
  selectedItem = '';
  showSelect = false;

  @Input() id = '';
  @Input() data: { id: string, [key: string]: any } = { id: ''};
  @Input() fieldInfo: QueryFieldInfo[] = [];
  @Output() updateEvent = new EventEmitter<any>();
  @Output() deleteEvent = new EventEmitter<any>();
  @Output() addEvent = new EventEmitter<any>();
  @Output() extendEvent = new EventEmitter<any>();

  @ViewChild('luceneComponentHost', { read: ViewContainerRef, static: true }) luceneComponentHost!: ViewContainerRef;

  constructor(private resolver: ComponentFactoryResolver) {
    this.id = shortid.generate();
    this.data = {id: this.id};
  }
    
  generateItems(term: Term, fieldInfo: QueryFieldInfo[]): void {
    const viewContainerRef = this.luceneComponentHost;
    viewContainerRef.clear();
    
    term.group!.forEach((component) => {
      const factory = this.resolver.resolveComponentFactory(component.operator? LuceneLogicInputComponent : LuceneSingleQueryInputComponent);
      const componentRef = viewContainerRef.createComponent<LuceneComponent>(factory);
      componentRef.instance.id = component.id;
      componentRef.instance.data = component;
      componentRef.instance.fieldInfo = fieldInfo;
      if (componentRef.instance instanceof LuceneSingleQueryInputComponent) {
        (componentRef.instance as LuceneSingleQueryInputComponent).requireExtendBtn = false;
      }
      componentRef.instance.updateEvent.subscribe(value => this.onEditQuery(value.id, value.data));
      componentRef.instance.deleteEvent.subscribe(id => this.onDeleteById(id));
      componentRef.instance.extendEvent?.subscribe(id => this.onExtendById(id));
    });
  }

  onDelete(): void {
    this.onDeleteById(this.id);
  }

  onDeleteById(id: string): void {
    this.deleteEvent.emit(id);
  }

  onEditQuery(id: string, data: any): void {
    this.updateEvent.emit({id: id, data: data});
  }

  onExtendById(id: string): void {
    this.extendEvent.emit(id);
  }

  addLuceneItem(event: any): void {
    this.selectedItem = event.target.value;
    this.addEvent.emit({groupId: this.id, key: this.selectedItem});
    this.showSelect = false;
  }
}
