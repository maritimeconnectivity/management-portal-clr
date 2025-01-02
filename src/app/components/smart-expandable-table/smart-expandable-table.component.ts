import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { ClarityModule, ClrDatagridModule, ClrDatagridStateInterface } from '@clr/angular';
import { ItemType, timestampKeys } from 'src/app/common/menuType';
import { ItemViewComponent } from "../item-view/item-view.component";
import { convertTime } from 'src/app/common/timeConverter';
import { ItemFormComponent } from "../item-form/item-form.component";
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { Role, RoleControllerService } from 'src/app/backend-api/identity-registry';

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
  @Input() totalPages: number = 0;
  @Input() totalElements: number = 0;
  @Input() getData: ((itemType: ItemType, pageNumber: number, elementsPerPage: number) => Promise<any[] | undefined>) = (itemType: ItemType) => new Promise((resolve, reject) => resolve([]));
  @Output() onRowSelect: EventEmitter<any> = new EventEmitter<any>();
  @Output() onRevokeCerts: EventEmitter<any[]> = new EventEmitter();
  @Output() onDownloadCerts: EventEmitter<any[]> = new EventEmitter();
  @Output() onEdit: EventEmitter<any> = new EventEmitter();
  @Output() onMigrate: EventEmitter<any> = new EventEmitter();
  @Output() onRefresh: EventEmitter<any> = new EventEmitter();
  @Output() onApprove: EventEmitter<any> = new EventEmitter();

  data: any[] | undefined = undefined;
  selected: any[] = [];
  detail: any = {};
  selectedItem : any = {};
  expanded: boolean = false;
  detailView: boolean = false;
  labelKeys: string[] = [];
  labelTitles: string[] = [];
  isLoading: boolean = false;
  pageNumbers: number[] = [];
  currentPageNumber = 0;
  currentPageRange = 0;
  visiblePageNumbers: number[] = [];
  elementsPerPage = 10;
  roles: Role[] = [];

  constructor(private router: Router,
    private authService: AuthService,
    private roleService: RoleControllerService
  ) {
    this.isLoading = true;
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    if (this.labels) {
      this.labelKeys = Object.keys(this.labels!);
      this.labelTitles = Object.values(this.labels!).map((label: any) => label.title);
    }

    this.authService.getOrgMrn().then((orgMrn) => {
      if (this.itemType === ItemType.Instance) {
        return;
      }
      this.roleService.getRoles(orgMrn).subscribe((roles) => {
        this.roles = roles;
      });
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.

    // apply updates of total pages for pagination
    if (changes['totalPages']) {
      this.pageNumbers = Array(this.totalPages).fill(0).map((x,i)=>i);
    }
    this.updateVisiblePageNumbers();
    
  }

  updateVisiblePageNumbers() {
    const startPage = this.currentPageRange * this.elementsPerPage;
    const endPage = Math.min(startPage + this.elementsPerPage, this.totalPages);
    this.visiblePageNumbers = Array.from(
      { length: endPage - startPage },
      (_, index) => startPage + index
    );
  }

  /**
   * Change the page range (left or right)
   * @param direction -1 for left, +1 for right
   */
  changePageRange(direction: number) {
    this.currentPageRange += direction;
    this.updateVisiblePageNumbers();
  }

  async loadData(pageNumber: number = this.currentPageNumber) {
    this.data = await this.getData(this.itemType, pageNumber, this.elementsPerPage) || [];
    if (pageNumber !== this.currentPageNumber) {
      this.currentPageNumber = pageNumber;
    }
    this.isLoading = false;
  }

  // this function is for background loading of data
  async refresh(state: ClrDatagridStateInterface) {
    if (!this.data) {
      this.loadData();
    }
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
    this.onEdit.emit(selectedItem);
  }

  approve = (selectedItem: any) => {
    this.onApprove.emit(selectedItem);
  }

  migrate = (newServiceMrn: string) => {
    this.onMigrate.emit({... this.selectedItem, newServiceMrn: newServiceMrn});
  }

  deleteItem = (selectedItem: any) => {
    this.onDelete?.call(this, [selectedItem]);
  }

  isTimestampFormat(key: string): boolean {
    return timestampKeys.includes(key);
  }

  convertTimeString = (time: string): string => {
    return convertTime(time);
  }

  refreshData = () => {
    this.loadData().then(() => {
      if (this.selectedItem && this.selectedItem.mrn) {
        const updatedItem = this.data?.find(item => 
          this.itemType === ItemType.Service ? item.mrn === this.selectedItem.mrn && item.instanceVersion === this.selectedItem.instanceVersion :
            this.itemType === ItemType.Role ? item.id === this.selectedItem.id :
              item.mrn === this.selectedItem.mrn);
        if (updatedItem) {
          this.selectedItem = updatedItem;
        }
      }
    });
  }
}
