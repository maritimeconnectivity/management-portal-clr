import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ClarityModule, ClrDatagridModule } from '@clr/angular';
import { SharedModule } from 'src/app/common/shared/shared.module';
import { ClarityIcons, downloadIcon, plusIcon, timesIcon } from '@cds/core/icon';
ClarityIcons.addIcons(downloadIcon, timesIcon, plusIcon);

@Component({
  selector: 'app-smart-table',
  standalone: true,
  imports: [
    ClarityModule,
    ClrDatagridModule,
  ],
  templateUrl: './smart-table.component.html',
  styleUrl: './smart-table.component.css'
})
export class SmartTableComponent {
  @Input() source: any[] = [];
  @Input() onDownload: ((selected: any[]) => void) | undefined;
  @Input() onDelete: ((selected: any[]) => void) | undefined;
  @Input() onAdd: (() => void) | undefined;
  @Input() deleteText: string = 'Delete';
  @Input() downloadText: string = 'Download';
  @Input() addText: string = 'Add';
  @Output() onUpdate: EventEmitter<any> = new EventEmitter();

  selected: any[] = [];

  onSelect(id: string) {
    console.log('Selected', id);
  }
}
