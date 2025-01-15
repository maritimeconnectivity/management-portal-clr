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

    for (const term of this.luceneTerm) {
      if ((term as Term).group) {
        const factory = this.resolver.resolveComponentFactory(LuceneTermInputComponent);
        const componentRef = viewContainerRef.createComponent<LuceneComponent>(factory);
        componentRef.instance.id = term.id;
        componentRef.instance.data = { ...(term as Term).group, id: term.id }!;
        componentRef.instance.fieldInfo = this.fieldInfo;
        componentRef.instance.onUpdate.subscribe(value => this.updateLuceneItem(value.id, value.data));
        componentRef.instance.onDelete.subscribe(id => this.deleteLuceneItem(id));
        componentRef.instance.onExtend?.subscribe(id => this.extendToGroup(id));
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

    // this.group.forEach((component) => {
    //   if ((component.data as Term).group) {
    //     console.log(component);
    //     const factory = this.resolver.resolveComponentFactory(LuceneTermInputComponent);
    //     const componentRef = viewContainerRef.createComponent<LuceneComponent>(factory);
    //     componentRef.instance.id = shortid.generate();
    //     componentRef.instance.data = (component.data as Term).group!;
    //     componentRef.instance.fieldInfo = this.fieldInfo;
    //     componentRef.instance.onUpdate.subscribe(value => this.editLuceneItem(value.id, value.data));
    //     componentRef.instance.onDelete.subscribe(id => this.deleteLuceneItem(id));
    //     componentRef.instance.onExtend?.subscribe(id => this.extendToGroup(id));
    //     if (componentRef.instance.generateItems) {
    //       componentRef.instance.generateItems(component.data, component.fieldInfo!);
    //     }
    //   } else {
    //     const factory = this.resolver.resolveComponentFactory(component.component);
    //     const componentRef = viewContainerRef.createComponent<LuceneComponent>(factory);
    //     componentRef.instance.id = component.id;
    //     componentRef.instance.data = component.data;
    //     componentRef.instance.fieldInfo = component.fieldInfo ? component.fieldInfo : undefined;
    //     componentRef.instance.onUpdate.subscribe(value => this.editLuceneItem(value.id, value.data));
    //     componentRef.instance.onDelete.subscribe(id => this.deleteLuceneItem(id));
    //     componentRef.instance.onExtend?.subscribe(id => this.extendToGroup(id));
    //   }
    // });
  }

  deleteLuceneItem(id: string) {
    this.luceneTerm = this.deleteTerm(this.luceneTerm, id);
    console.log(id);
    console.log(this.luceneTerm);
    /*
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
      */
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

  deleteTerm(terms: Term[], id: string): Term[] {
    for (const term of terms) {
      // group이 존재하면 재귀적으로 순회
      if (term.group && term.group.length > 0) {
        this.deleteTerm(term.group, id);
      }
    }
    const element = terms.filter(e => e.id === id).pop();
    if (element) {
      const index = terms.indexOf(element);
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

  updateLuceneItem(componentId: string, data: object): void {
    this.group = this.group.map(e => e.id === componentId ? { ...e, ...data } : e);
    this.luceneTerm = this.updateTerm(this.luceneTerm, componentId, data);
    //console.log(this.updateTerm(this.luceneTerm, componentId, data));
    /*
    this.luceneTerm = this.luceneTerm.map(e => {
      if (e.id === componentId) {
      return { ...e, ...data };
      } else if (e.group) {
      return { ...e, group: e.group.map(g => g.id === componentId ? { ...g, ...data } : g) };
      }
      return e;
    });
    */
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
    console.log(this.queryString);
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

  addLuceneItem(event: any): void {
    const value = event.target.value;
    if (this.luceneTerm.length > 0) {
      this.luceneTerm.push({ id: shortid.generate(), 'operator': LogicalOperator.And });
    }
    this.luceneTerm.push({ id: shortid.generate(), [this.fieldInfo?.filter(e => e.value === value).pop()?.value as string]: '' });

    this.updateLuceneQuery();
    this.loadComponent();
    this.selectedItem = '';
  }
}
