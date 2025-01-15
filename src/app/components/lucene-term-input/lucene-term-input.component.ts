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

  @Input() id: string = '';
  @Input() data: { id: string, [key: string]: any } = { id: ''};
  @Input() fieldInfo: QueryFieldInfo[] = [];
  @Output() onUpdate = new EventEmitter<any>();
  @Output() onDelete = new EventEmitter<any>();
  @Output() onExtend = new EventEmitter<any>();

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
      componentRef.instance.onUpdate.subscribe(value => this.onEditQuery(value.id, value.data));
      componentRef.instance.onDelete.subscribe(id => this.onDeleteById(id));
      componentRef.instance.onExtend?.subscribe(id => this.onExtendById(id));
    });
  }

  delete(): void {
    this.onDeleteById(this.id);
  }

  onDeleteById(id: string): void {
    this.onDelete.emit(id);
  }

  onEditQuery(id: string, data: any): void {
    this.onUpdate.emit({id: id, data: data});
  }

  onExtendById(id: string): void {
    this.onExtend.emit(id);
  }
}
