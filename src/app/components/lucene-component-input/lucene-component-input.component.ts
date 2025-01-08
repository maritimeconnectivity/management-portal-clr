import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClrComboboxModule, ClrInputModule } from '@clr/angular';
import { Observable, of } from 'rxjs';
import { QueryFieldInfo } from 'src/app/common/lucene-query/queryFieldInfo';

@Component({
  selector: 'app-lucene-component-input',
  standalone: true,
  imports: [
    ClrInputModule,
    ClrComboboxModule,
    FormsModule
  ],
  templateUrl: './lucene-component-input.component.html',
  styleUrl: './lucene-component-input.component.css'
})
export class LuceneComponentInputComponent {
  options: string[] = [];
  filteredOptions$: Observable<string[]> | undefined;

  @ViewChild('autoInput') input: any;

  @Input() fieldInfo: QueryFieldInfo[] = [];
  @Output() onCreate = new EventEmitter<any>();

  ngOnInit() {
    this.options = this.fieldInfo?.map(e => e.name);
    this.filteredOptions$ = of(this.options);
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
