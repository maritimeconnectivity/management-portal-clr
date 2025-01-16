import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClarityIcons, worldIcon } from '@cds/core/icon';
import { ClarityModule } from '@clr/angular';
import { LuceneComponent, Term } from 'src/app/common/lucene-query/lucene-component';
import { QueryFieldInfo } from 'src/app/common/lucene-query/queryFieldInfo';
ClarityIcons.addIcons(worldIcon)
@Component({
  selector: 'app-lucene-geo-query-input',
  standalone: true,
  imports: [
    ClarityModule,
    FormsModule,
    CommonModule
  ],
  templateUrl: './lucene-geo-query-input.component.html',
  styleUrl: './lucene-geo-query-input.component.css'
})
export class LuceneGeoQueryInputComponent implements OnInit, LuceneComponent{
  @Input() id: string = '';
  @Input() data: { id: string, [key: string]: any } = { id: ''};
  fieldInfo?: QueryFieldInfo[] | undefined;
  @Output() onUpdate = new EventEmitter<any>();
  @Output() onDelete = new EventEmitter<any>();
  @Output() onExtend = new EventEmitter<any>();

  constructor() {
    this.id = 'geo';
  }

  ngOnInit(): void {

  }

}
