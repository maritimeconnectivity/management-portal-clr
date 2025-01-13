import { Component, ComponentFactory, ComponentFactoryResolver, EventEmitter, Input, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClarityModule, ClrAlertModule, ClrInputModule, ClrSelectModule } from '@clr/angular';
import { LuceneComponentItem } from 'src/app/common/lucene-query/lucene-component-item';
import { QueryFieldInfo } from 'src/app/common/lucene-query/queryFieldInfo';
import { LuceneComponentDirective } from 'src/app/common/lucene-query/lucene-component-directive';
import { LuceneComponent } from 'src/app/common/lucene-query/lucene-component';
import { buildQuery } from 'src/app/common/lucene-query/query-builder';
import { LuceneLogicInputComponent } from '../lucene-logic-input/lucene-logic-input.component';
import { LogicalOperator } from 'src/app/common/lucene-query/localOperator';
import { LuceneSingleQueryInputComponent } from '../lucene-single-query-input/lucene-single-query-input.component';
import { ClarityIcons, filterGridIcon, connectIcon } from '@cds/core/icon';
import { srFieldInfo } from 'src/app/common/lucene-query/service-registry-field-info';
import { CommonModule } from '@angular/common';
import { LuceneQueryOutput } from 'src/app/common/lucene-query/lucene-query-output';
ClarityIcons.addIcons(filterGridIcon, connectIcon);
const shortid = require('shortid');

@Component({
  selector: 'app-svc-search-input',
  standalone: true,
  imports: [
    ClrSelectModule,
    ClarityModule,
    FormsModule,
    ClrInputModule,
    ClrAlertModule,
    CommonModule,
],
  templateUrl: './svc-search-input.component.html',
  styleUrl: './svc-search-input.component.css'
})
export class SvcSearchInputComponent {
  group: LuceneComponentItem[] = [];
  data: object[] = [{}];
  selectedItem: string = '';
  queryString = '';
  freetext = '';

  @Input() title: string = 'Service Search';
  @Input() btnTitle: string = 'Search';
  @Input() fieldInfo: QueryFieldInfo[] = srFieldInfo;
  @Output() onUpdateQuery = new EventEmitter<any>();

  @ViewChild('luceneQueryStringInput') luceneQueryStringInput!: { nativeElement: { value: string; }; };
  @ViewChild('luceneComponentHost', { read: ViewContainerRef, static: false }) luceneComponentHost!: ViewContainerRef;

  constructor(private resolver: ComponentFactoryResolver) {
  }

  ngAfterViewInit() {
    if (this.luceneComponentHost) {
      this.loadComponent();
    }
  }

  loadComponent() {
    const viewContainerRef = this.luceneComponentHost;
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
    this.updateLuceneQuery();
  }

  onEditQuery(componentId: string, data: object): void {
    this.group = this.group.map(e => e.id === componentId ? {...e, data: data} : e);
    this.updateLuceneQuery();
  }

  search(): void {
    console.log(this.queryString);
  }

  updateLuceneQuery = () => {
    const dataArray = this.group.map(e => e.data);
    this.queryString = buildQuery(dataArray);

    // flattening data array for SearchParameters
    let data: Record<string, any> = {};
    dataArray.forEach((e: { [key: string]: any }) => {
      if (Object.keys(e).length &&
        Object.keys(e).pop() !== 'operator') {
          const key = Object.keys(e).pop();
          if (key) {
            data[key] = e[key];
          }
        }
      });
    this.luceneQueryStringInput.nativeElement.value = this.queryString;

    // get rid of " to convert it to the freetext
    if (this.queryString.length > 0) {
      this.freetext = this.queryString.split('"').join('');
    }
  }

  onQueryStringChanged = (event: any) => {
    this.queryString = event.target.value;
    if (this.queryString.length === 0) {
      this.clearInput();
    }
  }

  clearInput(): void {
    this.group = [];
    this.loadComponent();
  }

  onSelectionChange(event: any): void {
    const value = event.target.value;
    if (this.group.length > 0) {
      this.group.push(new LuceneComponentItem(LuceneLogicInputComponent, shortid.generate(), {'operator': LogicalOperator.And}));
    }
    this.group.push(new LuceneComponentItem(LuceneSingleQueryInputComponent, shortid.generate(),
      {[this.fieldInfo?.filter(e => e.value === value).pop()?.value as string]: ''}, this.fieldInfo));
    this.loadComponent();
    this.updateLuceneQuery();
    this.selectedItem = '';
  }
}
