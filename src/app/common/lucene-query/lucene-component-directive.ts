import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[luceneComponentHost]',
})
export class LuceneComponentDirective{
    constructor(public viewContainerRef: ViewContainerRef) { }
}