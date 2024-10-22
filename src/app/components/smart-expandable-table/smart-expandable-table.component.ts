import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ClarityModule, ClrDatagridModule, ClrDatagridStateInterface } from '@clr/angular';
import { ItemType, timestampKeys } from 'src/app/common/menuType';
import { ItemViewComponent } from "../item-view/item-view.component";
import { convertTime } from 'src/app/common/timeConverter';
import { ItemFormComponent } from "../item-form/item-form.component";
import { Router } from '@angular/router';

@Component({
  selector: 'app-smart-expandable-table',
  standalone: true,
  imports: [
    ClarityModule,
    ClrDatagridModule,
    ItemViewComponent,
    ItemFormComponent
],
  templateUrl: './smart-expandable-table.component.html',
  styleUrl: './smart-expandable-table.component.css'
})
export class SmartExpandableTableComponent {
  @Input() itemType: ItemType = ItemType.Device;
  @Input() labels: {[key: string]: any} | undefined = undefined;
  @Input() placeholder: string = 'We couldn\'t find any data!';
  @Input() onDownload: ((selected: any[]) => void) | undefined;
  @Input() onDelete: ((selected: any[]) => void) | undefined;
  @Input() onAdd: (() => void) | undefined;
  @Input() deleteText: string = 'Delete';
  @Input() downloadText: string = 'Download';
  @Input() addText: string = 'Add';
  @Input() getData: ((itemType: ItemType) => Promise<any[] | undefined>) = (itemType: ItemType) => new Promise((resolve, reject) => resolve([]));
  @Output() onRowSelect: EventEmitter<any> = new EventEmitter<any>();
  @Output() onIssueCert: EventEmitter<any> = new EventEmitter();
  @Output() onRevokeCerts: EventEmitter<any[]> = new EventEmitter();
  @Output() onDownloadCerts: EventEmitter<any[]> = new EventEmitter();

  data: any[] | undefined = undefined;
  selected: any[] = [];
  detail: any = {};
  selectedItem : any = {};
  expanded: boolean = false;
  detailView: boolean = false;
  labelKeys: string[] = [];
  labelTitles: string[] = [];
  isLoading: boolean = false;

  constructor(private router: Router) {
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    if (this.labels) {
      this.labelKeys = Object.keys(this.labels!);
      this.labelTitles = Object.values(this.labels!).map((label: any) => label.title);
    }
  }

  async refresh(state: ClrDatagridStateInterface) {
    if (!this.data) {
      this.data = await this.getData(this.itemType) || [];
    }
    /*
    if(this.labels) {
      console.log(state);
      this.labelKeys = Object.keys(this.labels!);
      this.labelTitles = Object.values(this.labels!).map((label: any) => label.title);
    }

    
    const filters: { [prop: string]: any[] } = {};
    if (state.filters) {
      for (const filter of state.filters) {
        const { property, value } = <{ property: string; value: string }>filter;
        filters[property] = [value];
      }
    }

    const pageSize = state.page?.size || 10;
    const currentPage = state.page?.current || 1;

    this.inventory
      .filter(filters)
      .sort(<{ by: string; reverse: boolean }>state.sort)
      .fetch(pageSize * (currentPage - 1), pageSize)
      .then((result: FetchResult) => {
        this.users = result.users;
        this.isLoading = false;
      });
      */
  }
  
  onSelect(id: string) {
    console.log('Selected', id);
  }

  userRowSelect = (selectedItem: any) => {
    this.expanded = true;
    this.selectedItem = selectedItem;
    this.onRowSelect.emit(selectedItem);
  }

  back = () => {
    this.expanded = false;
    this.selectedItem = {};
  }

  edit = (selectedItem: any) => {
    this.expanded = true;
    this.selectedItem = selectedItem;
    this.router.navigateByUrl('/pages/ir/'+this.itemType+'/'+selectedItem.mrn);
  }

  isTimestampFormat(key: string): boolean {
    return timestampKeys.includes(key);
  }

  convertTimeString = (time: string): string => {
    return convertTime(time);
  }

  issueCert = () => {
    this.onIssueCert.emit(this.selectedItem);
  }

  revokeCerts = (certs: any[]) => {
    this.onRevokeCerts.emit(certs);
  }

  downloadCerts = (certs: any[]) => {
    this.onDownloadCerts.emit(certs);
  }
}
