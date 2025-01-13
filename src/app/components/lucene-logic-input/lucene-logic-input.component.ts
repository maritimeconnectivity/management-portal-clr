import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClarityModule } from '@clr/angular';
import { LogicalOperator } from 'src/app/common/lucene-query/localOperator';

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
  @Input() id: string = '';
  @Input() data: { [key: string]: any } = {operator: LogicalOperator.And};
  @Output() onUpdate = new EventEmitter<any>();
  @Output() onDelete = new EventEmitter<any>();

  onSelectionChange(event: any): void {
    this.data = {operator: event};
    this.onUpdate.emit({id: this.id, data: this.data});
  }
}
