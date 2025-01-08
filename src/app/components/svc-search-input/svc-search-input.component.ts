import { Component, ComponentFactory, ComponentFactoryResolver, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClrInputModule, ClrSelectModule } from '@clr/angular';
import { ComponentsModule } from '../components.module';
import { LuceneComponentInputComponent } from '../lucene-component-input/lucene-component-input.component';
import { LuceneComponentItem } from 'src/app/common/lucene-query/lucene-component-item';
import { QueryFieldInfo } from 'src/app/common/lucene-query/queryFieldInfo';
import { LuceneComponentDirective } from 'src/app/common/lucene-query/lucene-component-directive';
import { LuceneComponent } from 'src/app/common/lucene-query/lucene-component';
import { buildQuery } from 'src/app/common/lucene-query/query-builder';
import { LuceneLogicInputComponent } from '../lucene-logic-input/lucene-logic-input.component';
import { LogicalOperator } from 'src/app/common/lucene-query/localOperator';
import { LuceneSingleQueryInputComponent } from '../lucene-single-query-input/lucene-single-query-input.component';
const shortid = require('shortid');

@Component({
  selector: 'app-svc-search-input',
  standalone: true,
  imports: [
    ClrSelectModule,
    FormsModule,
    ClrInputModule,
    ComponentsModule,
    LuceneComponentInputComponent
  ],
  templateUrl: './svc-search-input.component.html',
  styleUrl: './svc-search-input.component.css'
})
export class SvcSearchInputComponent {
  group: LuceneComponentItem[] = [];
  data: object[] = [{}];

  @Input() fieldInfo: QueryFieldInfo[] = [];
  @Output() onUpdateQuery = new EventEmitter<any>();
  @ViewChild(LuceneComponentDirective, {static: true}) luceneComponentHost!: LuceneComponentDirective;

  constructor(private resolver: ComponentFactoryResolver) {
  }

  loadComponent() {
    const viewContainerRef = this.luceneComponentHost.viewContainerRef;
    viewContainerRef.clear();

    this.group.forEach((component) => {
      const factory = this.resolver.resolveComponentFactory(component.component);
      const componentRef = viewContainerRef.createComponent<LuceneComponent>(factory);
      componentRef.instance.id = component.id;
      componentRef.instance.data = component.data;
      componentRef.instance.fieldInfo = component.fieldInfo ? component.fieldInfo : undefined;
      componentRef.instance.onUpdate.subscribe(value => this.onEditQuery(value.id, value.data));
      componentRef.instance.onDelete.subscribe(id => this.onDeleteById(id));
    });
  }

  ngOnInit(): void {
    this.loadComponent();
  }

  onDeleteById(id: string) {
    const element = this.group.filter(e => e.id === id).pop();
    if (element) {
      const index = this.group.indexOf(element);
      if (index === 0) {
        if (this.group.length === 1) {
          this.group.splice(0, 1);
        } else {
          this.group.splice(0, 2);
        }
      } else {
        this.group.splice(index - 1, 2);
      }
    }
    this.loadComponent();
    this.exportQuery();
  }

  exportQuery() {
    const dataArray = this.group.map(e => e.data);
    const queryString = buildQuery(dataArray);

    // flattening data array for SearchParameters
    let data: { [key: string]: any } = {};
    dataArray.forEach((e: { [key: string]: any }) => {
      if (Object.keys(e).length &&
        Object.keys(e).pop() !== 'operator') {
          const key = Object.keys(e).pop();
          if (key) {
            data[key] = e[key];
          }
        }
      });
    this.onUpdateQuery.emit({queryString, data});
  }

  onEditQuery(componentId: string, data: object): void {
    this.group = this.group.map(e => e.id === componentId ? {...e, data: data} : e);
    this.exportQuery();
  }

  onCreate(value: any): void {
    if (this.group.length > 0) {
      this.group.push(new LuceneComponentItem(LuceneLogicInputComponent, shortid.generate(), {'operator': LogicalOperator.And}));
    }
    this.group.push(new LuceneComponentItem(LuceneSingleQueryInputComponent, shortid.generate(),
      {[this.fieldInfo?.filter(e => e.name === value).pop()?.value as string]: ''}, this.fieldInfo));
    this.loadComponent();
  }

  clearInput(): void {
    this.group = [];
    this.loadComponent();
  }
}
