import { Component, ComponentFactory, ComponentFactoryResolver, EventEmitter, Input, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClarityModule, ClrAlertModule, ClrInputModule, ClrSelectModule } from '@clr/angular';
import { LuceneComponentItem } from 'src/app/common/lucene-query/lucene-component-item';
import { QueryFieldInfo } from 'src/app/common/lucene-query/queryFieldInfo';
import { LuceneComponentDirective } from 'src/app/common/lucene-query/lucene-component-directive';
import { LuceneComponent, Term } from 'src/app/common/lucene-query/lucene-component';
import { buildQuery } from 'src/app/common/lucene-query/query-builder';
import { LuceneLogicInputComponent } from '../lucene-logic-input/lucene-logic-input.component';
import { LogicalOperator } from 'src/app/common/lucene-query/localOperator';
import { LuceneSingleQueryInputComponent } from '../lucene-single-query-input/lucene-single-query-input.component';
import { ClarityIcons, filterGridIcon, connectIcon } from '@cds/core/icon';
import { srFieldInfo } from 'src/app/common/lucene-query/service-registry-field-info';
import { CommonModule } from '@angular/common';
import { LuceneQueryOutput } from 'src/app/common/lucene-query/lucene-query-output';
import { LuceneTermInputComponent } from '../lucene-term-input/lucene-term-input.component';
import { LuceneGeoQueryInputComponent } from '../lucene-geo-query-input/lucene-geo-query-input.component';
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
  luceneTerm: Term[] = [];
  selectedItem: string = '';
  queryString = '';
  geometryIncluded: boolean = false;

  @Input() title: string = 'Service Search';
  @Input() btnTitle: string = 'Search';
  @Input() fieldInfo: QueryFieldInfo[] = srFieldInfo;
  @Output() onSearch = new EventEmitter<any>();
  @Output() onClearAll = new EventEmitter<any>();

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

    // create visual components based on luceneTerm
    for (const term of this.luceneTerm) {
      if ((term as Term).group && (term as Term).group!.length > 0) {
        const factory = this.resolver.resolveComponentFactory(LuceneTermInputComponent);
        const componentRef = viewContainerRef.createComponent<LuceneComponent>(factory);
        componentRef.instance.id = term.id;
        componentRef.instance.data = { ...(term as Term).group, id: term.id }!;
        componentRef.instance.fieldInfo = this.fieldInfo;
        componentRef.instance.onUpdate.subscribe(value => this.updateLuceneItem(value.id, value.data));
        componentRef.instance.onDelete.subscribe(id => this.deleteLuceneItem(id));
        componentRef.instance.onExtend?.subscribe(id => this.extendToGroup(id));
        componentRef.instance.onAdd?.subscribe(item => this.addLuceneItemForGroup(item));
        if (componentRef.instance.generateItems) {
          componentRef.instance.generateItems(term, this.fieldInfo);
        }
        // when the term is not in the group
        if (!this.group.find(e => e.id === term.id)) {
          this.group.push(new LuceneComponentItem(LuceneTermInputComponent, componentRef.instance.id, componentRef.instance.data, this.fieldInfo));
        }
      } else {
        const factory = this.resolver.resolveComponentFactory(term.operator ? LuceneLogicInputComponent : LuceneSingleQueryInputComponent);
        const componentRef = viewContainerRef.createComponent<LuceneComponent>(factory);
        componentRef.instance.id = term.id;
        componentRef.instance.data = term;
        componentRef.instance.fieldInfo = this.fieldInfo;
        componentRef.instance.onUpdate.subscribe(value => this.updateLuceneItem(value.id, value.data));
        componentRef.instance.onDelete.subscribe(id => this.deleteLuceneItem(id));
        componentRef.instance.onExtend?.subscribe(id => this.extendToGroup(id));
        if (!this.group.find(e => e.id === term.id)) {
          this.group.push(new LuceneComponentItem(factory.componentType, componentRef.instance.id, componentRef.instance.data, this.fieldInfo));
        }
      }
    }
    if (this.geometryIncluded) {
      if (this.luceneTerm.length > 0) {
        const factory = this.resolver.resolveComponentFactory(LuceneLogicInputComponent);
        const componentRef = viewContainerRef.createComponent<LuceneComponent>(factory);
        componentRef.instance.id = shortid.generate();
        componentRef.instance.fieldInfo = this.fieldInfo;
        componentRef.instance.onUpdate.subscribe(value => this.updateLuceneItem(value.id, value.data));
        componentRef.instance.onDelete.subscribe(id => this.deleteLuceneItem(id));
        componentRef.instance.onExtend?.subscribe(id => this.extendToGroup(id));
        if (!this.group.find(e => e.id === componentRef.instance.id)) {
          this.group.push(new LuceneComponentItem(factory.componentType, componentRef.instance.id, componentRef.instance.data, this.fieldInfo));
        }
      }
      const factory = this.resolver.resolveComponentFactory(LuceneGeoQueryInputComponent);
      const componentRef = viewContainerRef.createComponent<LuceneComponent>(factory);
      componentRef.instance.id = 'geo';
      if (!this.group.find(e => e.id === 'geo')) {
        this.group.push(new LuceneComponentItem(factory.componentType, componentRef.instance.id, componentRef.instance.data, this.fieldInfo));
      }
    }
  }

  addGeoItem(): void {
    this.geometryIncluded = true;
    this.loadComponent();
    this.updateLuceneQuery();
  }

  deleteGeoItem(): void {
    this.geometryIncluded = false;
    this.loadComponent();
    this.updateLuceneQuery();
  }

  deleteLuceneItem(id: string) {
    this.luceneTerm = this.deleteTerm(this.luceneTerm, id);
    this.loadComponent();
    this.updateLuceneQuery();
  }

  updateTerm(terms: Term[], id: string, data: object): Term[] {
    for (const term of terms) {
      if (term.id === id) {
        Object.assign(term, data);
      }
  
      if (term.group && term.group.length > 0) {
        this.updateTerm(term.group, id, data);
      }
    }
    return terms;
  }

  addTermToGroup(terms: Term[], groupId: string, key: string): Term[] {
    for (const term of terms) {
      if (term.id === groupId) {
        term.group?.push({ id: shortid.generate(), 'operator': LogicalOperator.And });
        term.group?.push({ id: shortid.generate(), [key]: '' });
      }
  
      if (term.group && term.group.length > 0) {
        this.addTermToGroup(term.group, groupId, key);
      }
    }
    return terms;
  }

  addTerm(terms: Term[], target: Term): Term[] {
    if (terms.length > 0) {
      terms.push({ id: shortid.generate(), 'operator': LogicalOperator.And });
    }
    terms.push(target);
    return terms;
  }

  deleteOperandAndOperator(terms: Term[], target: Term): Term[] {
    if (target) {
      const index = terms.indexOf(target);
      if (index === 0) {
        if (terms.length === 1) {
          terms.splice(0, 1);
        } else {
          terms.splice(0, 2);
        }
      } else {
        terms.splice(index - 1, 2);
      }
    }
    return terms;
  }

  deleteTerm(terms: Term[], id: string): Term[] {
    for (const term of terms) {
      // group이 존재하면 재귀적으로 순회
      if (term.group && term.group.length > 0) {
        this.deleteTerm(term.group, id);
      }
    }
    terms.filter(e => e.group && e.group.length === 0).forEach(e => this.deleteOperandAndOperator(terms, e));
    const element = terms.filter(e => e.id === id).pop();
    if (element) {
      this.deleteOperandAndOperator(terms, element);
    }
    
    return terms;
  }

  updateLuceneItem(componentId: string, data: object): void {
    this.group = this.group.map(e => e.id === componentId ? { ...e, ...data } : e);
    this.luceneTerm = this.updateTerm(this.luceneTerm, componentId, data);
    this.updateLuceneQuery();
  }

  extendToGroup(id: string): void {
    this.updateLuceneQuery();
    const index = this.luceneTerm.findIndex(e => e.id === id);
    if (index !== -1) {
      const termToBeExchanged = this.luceneTerm[index];

      // first inject new component into the lucene term.
      this.luceneTerm = this.luceneTerm.map(term => term.id === termToBeExchanged.id ?
        { id: shortid.generate(), group: [{ ...termToBeExchanged, id: id }, { id: shortid.generate(), operator: LogicalOperator.Or }, { ...termToBeExchanged, id: shortid.generate() }] } : term);

      // second remove the old component from the group
      this.group = this.group.filter(e => e.id !== id);
    }
    this.loadComponent();
    this.updateLuceneQuery();
  }

  search(): void {
    this.onSearch.emit(this.queryString);
  }

  updateLuceneQuery = () => {
    this.queryString = buildQuery(this.luceneTerm);
    // flattening data array for SearchParameters
    let data: Record<string, any> = {};
    this.luceneTerm.forEach((e: { [key: string]: any }) => {
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
    if (this.queryString && this.queryString.length > 0) {
      this.queryString = this.queryString.split('"').join('');
    }
  }

  onQueryStringChanged = (event: any) => {
    this.queryString = event.target.value;
    if (this.queryString.length === 0) {
      this.clearInput();
    }
  }

  clearInput(): void {
    this.luceneTerm = [];
    this.updateLuceneQuery();
    this.loadComponent();
    this.onClearAll.emit();
  }

  addLuceneItem(event: any): void {
    const value = event.target.value;
    this.luceneTerm = this.addTerm(this.luceneTerm, { id: shortid.generate(), [this.fieldInfo?.filter(e => e.value === value).pop()?.value as string]: '' });

    this.updateLuceneQuery();
    this.loadComponent();
    event.target.value = '';
  }

  addLuceneItemForGroup(item: any): void {
    this.addTermToGroup(this.luceneTerm, item.groupId, item.key);
    this.updateLuceneQuery();
    this.loadComponent();
  }
}
