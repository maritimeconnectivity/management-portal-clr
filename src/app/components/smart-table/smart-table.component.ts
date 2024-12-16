import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { ClarityModule, ClrDatagridModule } from '@clr/angular';
import { SharedModule } from 'src/app/common/shared/shared.module';
import { ClarityIcons, downloadIcon, plusIcon, timesIcon } from '@cds/core/icon';
import { toCamelCase } from 'src/app/common/stringUtils';
import { ItemType, timestampKeys } from 'src/app/common/menuType';
import { timestamp } from 'rxjs';
import { convertTime } from 'src/app/common/timeConverter';

ClarityIcons.addIcons(downloadIcon, timesIcon, plusIcon);

@Component({
  selector: 'app-smart-table',
  standalone: true,
  imports: [
    ClarityModule,
    ClrDatagridModule
],
  templateUrl: './smart-table.component.html',
  styleUrl: './smart-table.component.css'
})
export class SmartTableComponent {
  @Input() data: any[] = [];
  @Input() itemType: ItemType = ItemType.Device;
  @Input() labels: {[key: string]: any} = {};
  @Input() placeholder: string = 'We couldn\'t find any data!';
  @Input() onDownload: ((selected: any[]) => void) | undefined;
  @Input() onDelete: ((selected: any[]) => void) | undefined;
  @Input() onAdd: (() => void) | undefined;
  @Input() deleteText: string = 'Delete';
  @Input() downloadText: string = 'Download';
  @Input() addText: string = 'Add';
  @Input() selectedIds: any[] = [];
  @Output() onRowSelect: EventEmitter<any> = new EventEmitter<any>();

  selected: any[] = [];
  detail: any = {};
  isLoading: boolean = false;
  labelKeys: string[] = [];
  labelTitles: string[] = [];

  constructor() {
    this.isLoading = true;
  }

  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    if (changes['data'].currentValue.length > 0) {
      this.labelKeys = Object.keys(this.labels);
      this.labelTitles = Object.values(this.labels).map((label: any) => label.title);
    }
    this.isLoading = false;
    if (this.data.length > 0 && this.selectedIds.length > 0) {
      this.selected = this.data.filter((item: any) => this.selectedIds[0] === item.serialNumber);
    }
  }

  userRowSelect = (selected: any) => {
    if (this.onRowSelect) {
      this.onRowSelect.emit(selected);
    }
  }

  isTimestampFormat(key: string): boolean {
    return timestampKeys.includes(key);
  }

  convertTimeString = (time: string): string => {
    return convertTime(time);
  }

}
