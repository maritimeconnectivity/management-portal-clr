import { LogicalOperator } from './localOperator';
import { QueryFieldInfo } from './queryFieldInfo';
import { EventEmitter } from "@angular/core";

export interface LuceneComponent {
    id: string;
    data: Term;
    fieldInfo?: QueryFieldInfo[];
    onUpdate: EventEmitter<any>;
    onDelete: EventEmitter<any>;
    onExtend?: EventEmitter<any>;

    generateItems?(data: Term, fieldInfo: QueryFieldInfo[]): void;
}

export interface Term {
  id: string;
  operator?: LogicalOperator;
  group?: Term[];
  [key: string]: any;
}