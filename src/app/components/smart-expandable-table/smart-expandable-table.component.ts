import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { ClarityModule, ClrDatagridModule } from '@clr/angular';
import { ClarityIcons, downloadIcon, plusIcon, timesIcon } from '@cds/core/icon';
import { toCamelCase } from 'src/app/common/stringUtils';
import { ItemType, timestampKeys } from 'src/app/common/menuType';
import { ItemViewComponent } from "../item-view/item-view.component";
import { convertTime } from 'src/app/common/timeConverter';

@Component({
  selector: 'app-smart-expandable-table',
  standalone: true,
  imports: [
    ClarityModule,
    ClrDatagridModule,
    ItemViewComponent
  ],
  templateUrl: './smart-expandable-table.component.html',
  styleUrl: './smart-expandable-table.component.css'
})
export class SmartExpandableTableComponent {
  @Input() data: any[] = [];
  @Input() itemType: ItemType = ItemType.Device;
  @Input() labels: {[key: string]: any} = {};
  @Input() placeholder: string = 'We couldn\'t find any data!';
  @Input() onDownload: ((selected: any[]) => void) | undefined;
  @Input() onDelete: ((selected: any[]) => void) | undefined;
  @Input() onAdd: (() => void) | undefined;
  @Output() onRowSelect: EventEmitter<any> = new EventEmitter<any>();
  @Input() deleteText: string = 'Delete';
  @Input() downloadText: string = 'Download';
  @Input() addText: string = 'Add';
  @Output() onUpdate: EventEmitter<any> = new EventEmitter();

  selected: any[] = [];
  detail: any = {};
  selectedItem : any = {};
  expanded: boolean = false;
  isLoading: boolean = false;
  detailView: boolean = false;
  labelKeys: string[] = [];
  labelTitles: string[] = [];

  constructor() {
    this.isLoading = true;
  }

  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    if (changes['data'].currentValue.length > 0) {
      console.log(this.labels);
      this.labelKeys = Object.keys(this.labels);
      this.labelTitles = Object.values(this.labels).map((label: any) => label.title);
      this.isLoading = false;
    }
  }
  
  onSelect(id: string) {
    console.log('Selected', id);
  }

  userRowSelect = (selectedItem: any) => {
    this.expanded = true;
    this.selectedItem = selectedItem;
  }

  back = () => {
    this.expanded = false;
    this.selectedItem = {};
  }

  isTimestampFormat(key: string): boolean {
    return timestampKeys.includes(key);
  }

  convertTimeString = (time: string): string => {
    return convertTime(time);
  }
}
