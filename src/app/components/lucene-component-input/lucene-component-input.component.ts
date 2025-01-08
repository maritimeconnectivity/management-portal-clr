import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClrComboboxModule, ClrInputModule, ClrSelectModule } from '@clr/angular';
import { Observable, of } from 'rxjs';
import { QueryFieldInfo } from 'src/app/common/lucene-query/queryFieldInfo';
import { srFieldInfo } from 'src/app/common/lucene-query/service-registry-field-info';

@Component({
  selector: 'app-lucene-component-input',
  standalone: true,
  imports: [
    ClrInputModule,
    ClrComboboxModule,
    FormsModule,
    ClrSelectModule,
    CommonModule
  ],
  templateUrl: './lucene-component-input.component.html',
  styleUrl: './lucene-component-input.component.css'
})
export class LuceneComponentInputComponent {
  options: string[] = [];
  filteredOptions = srFieldInfo;

  @ViewChild('autoInput') input: any;

  @Input() fieldInfo: QueryFieldInfo[] = [];
  @Output() onCreate = new EventEmitter<any>();

  ngOnInit() {
    console.log('fieldInfo', this.fieldInfo);
    this.options = this.fieldInfo?.map(e => e.name);
    //this.filteredOptions$ = of(this.options);
  }

  private filter(value: string): string | undefined {
    if (value.length === 0) {
      return undefined;
    }
    const filterValue = value.toLowerCase();
    return this.options.filter(optionValue => optionValue.toLowerCase() === filterValue).pop();
  }

  onChange(event: string) {
    const value = this.filter(event);
    if (value) {
      this.onCreate.emit(value);
    }
  }

  onSelectionChange(event: string) {
    const value = this.filter(event);
    if (value) {
      this.onCreate.emit(value);
    }
    this.input.nativeElement.value = '';
  }
}
