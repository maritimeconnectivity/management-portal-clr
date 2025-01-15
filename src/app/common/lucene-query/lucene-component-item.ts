import { QueryFieldInfo } from './queryFieldInfo';
import { LuceneComponent } from './lucene-component';
import { Type } from "@angular/core";

export class LuceneComponentItem {
    constructor(
        public component: Type<LuceneComponent>,
        public id: string,
        public data: object,
        public fieldInfo?: QueryFieldInfo[],
        ) {}
}