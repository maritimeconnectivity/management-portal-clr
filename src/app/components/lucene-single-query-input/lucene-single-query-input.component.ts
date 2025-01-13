import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClarityIcons, codeIcon } from '@cds/core/icon';
import { ClarityModule, ClrAlertModule, ClrComboboxModule } from '@clr/angular';
import { LuceneComponent } from 'src/app/common/lucene-query/lucene-component';
import { QueryFieldInfo } from 'src/app/common/lucene-query/queryFieldInfo';
import { srFieldInfo } from 'src/app/common/lucene-query/service-registry-field-info';
ClarityIcons.addIcons(codeIcon);

@Component({
  selector: 'app-lucene-single-query-input',
  standalone: true,
  imports: [
    ClarityModule,
    FormsModule,
    CommonModule
  ],
  templateUrl: './lucene-single-query-input.component.html',
  styleUrl: './lucene-single-query-input.component.css'
})

export class LuceneSingleQueryInputComponent implements OnInit, LuceneComponent {
  options: string[] = [];
  selectedItem: string = '';
  field: string = '';
  fieldValue: string = '';
  valueEditable: boolean = false;
  value: string = '';

  @Input() requireCloseBtn: boolean = true;
  @Input() requireInfo: boolean = false;
  @Input() id: string = '';
  @Input() data: { [key: string]: any } = {};
  @Input() fieldInfo: QueryFieldInfo[] = srFieldInfo;
  @Output() onUpdate = new EventEmitter<any>();
  @Output() onDelete = new EventEmitter<any>();

  constructor() {
    this.options = this.fieldInfo?.map(e => e.name);
  }

  ngOnInit(): void {
    this.applyData();
  }

  applyData() {
    if (this.fieldInfo) {
      this.selectedItem = this.getFilteredKey(this.data).pop()!;
      this.field = this.selectedItem;
      this.fieldValue = this.data[this.selectedItem] ? this.data[this.selectedItem] : '';
    }
  }

  getFilteredKey(data: object) {
    const array1 = Object.keys(data);
    const array2 = this.fieldInfo.map(e => e.value);
    return array1.filter(value => array2.includes(value));
  }

  onEdit(event: any): void {
    const value: string = event.target.value;
    if (this.field) {
      this.data = {[this.field]: value};
      this.fieldValue = value;
      this.onUpdate.emit({id: this.id, data: this.data});
    }
  }

  onSelectionChange(value: any): void {
    this.field = value;
    this.valueEditable = true;
    this.data = {[this.field]: this.fieldValue};
    this.onUpdate.emit({id: this.id, data: this.data});
  }

  delete(): void {
    this.onDelete.emit(this.id);
  }

  createExpressionWithBrackets(): void {
    
  }
}
