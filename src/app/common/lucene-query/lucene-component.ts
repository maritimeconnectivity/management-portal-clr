import { QueryFieldInfo } from './queryFieldInfo';
import { EventEmitter } from "@angular/core";

export interface LuceneComponent {
    id: string;
    data: object;
    fieldInfo?: QueryFieldInfo[];
    onUpdate: EventEmitter<any>;
    onDelete: EventEmitter<any>;
}
