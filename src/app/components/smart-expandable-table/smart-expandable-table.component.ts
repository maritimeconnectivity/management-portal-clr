/*
 * Copyright (c) 2025 Maritime Connectivity Platform Consortium
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { ClarityModule, ClrDatagridModule, ClrDatagridStateInterface } from '@clr/angular';
import { ItemType, itemTypeToString, timestampKeys } from 'src/app/common/menuType';
import { ItemViewComponent } from "../item-view/item-view.component";
import { convertTime } from 'src/app/common/timeConverter';
import { ItemFormComponent } from "../item-form/item-form.component";
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { Role, RoleControllerService } from 'src/app/backend-api/identity-registry';
import { ComponentsModule } from '../components.module';
import { SvcSearchInputComponent } from '../svc-search-input/svc-search-input.component';

@Component({
  selector: 'app-smart-expandable-table',
  standalone: true,
  imports: [
    ClarityModule,
    ClrDatagridModule,
    ItemViewComponent,
],
  templateUrl: './smart-expandable-table.component.html',
  styleUrl: './smart-expandable-table.component.css'
})
export class SmartExpandableTableComponent {
  @Input() itemType: ItemType = ItemType.Device;
  @Input() labels: {[key: string]: any} | undefined = undefined;
  @Input() placeholder: string = 'We couldn\'t find any data!';
  @Input() downloadCall: ((selected: any[]) => void) | undefined;
  @Input() deleteCall: ((selected: any[]) => void) | undefined;
  @Input() addCall: (() => void) | undefined;
  @Input() deleteText: string = 'Delete';
  @Input() downloadText: string = 'Download';
  @Input() addText: string = 'Add';
  @Input() totalPages: number = 0;
  @Input() totalElements: number = 0;
  @Input() hasEditPermission: boolean = false;
  @Input() getData: ((itemType: ItemType, pageNumber: number, elementsPerPage: number, secomSearchParam?: object, xactId? : string)
      => Promise<any[] | undefined>) = (itemType: ItemType) => new Promise((resolve, reject) => resolve([]));
  @Output() rowSelectEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() revokeCertsEvent: EventEmitter<any[]> = new EventEmitter();
  @Output() downloadCertsEvent: EventEmitter<any[]> = new EventEmitter();
  @Output() editEvent: EventEmitter<any> = new EventEmitter();
  @Output() viewEvent: EventEmitter<any> = new EventEmitter();
  @Output() migrateEvent: EventEmitter<any> = new EventEmitter();
  @Output() refreshEvent: EventEmitter<any> = new EventEmitter();
  @Output() approveEvent: EventEmitter<any> = new EventEmitter();

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

  constructor(private router: Router,
    private authService: AuthService,
  ) {
    this.isLoading = true;
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.

    this.loadElementsPerPage();

    this.authService.getOrgMrnFromToken().then((orgMrn) => {
      if (this.itemType === ItemType.Instance) {
        return;
      }
    });
  }

  loadElementsPerPage = () => {
    // Retrieve the number of elements per page from localStorage
    const storedElementsPerPage = localStorage.getItem('management-portal:elementsPerPage');
    this.elementsPerPage = storedElementsPerPage ? parseInt(storedElementsPerPage) : 10;
  }

  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    if (changes['labels']) {
      this.labelKeys = Object.keys(this.labels!);
      this.labelTitles = Object.values(this.labels!).map((label: any) => label.title);
    }
    
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

  async loadData(pageNumber: number = this.currentPageNumber, xactId? : string) {
    this.data = await this.getData(this.itemType, pageNumber, this.elementsPerPage, undefined, xactId) || [];
    if (pageNumber !== this.currentPageNumber) {
      this.currentPageNumber = pageNumber;
    }
    this.isLoading = false;
  }

  // this function is for background loading of data
  async onRefresh(state: ClrDatagridStateInterface) {
    if (!this.data) {
      this.loadData();
    }
  }

  userRowSelect = (selectedItem: any) => {
    if (this.itemType === ItemType.SearchObjectResult) {
      this.viewEvent.emit(selectedItem);
    } else {
      this.expanded = true;
      this.selectedItem = selectedItem;
      this.rowSelectEvent.emit(selectedItem);
    }
  }

  back = () => {
    this.expanded = false;
    this.selectedItem = {};
  }

  clear = () => {
    this.data = [];
  }

  onEdit = (selectedItem: any) => {
    this.expanded = true;
    this.selectedItem = selectedItem;
    this.editEvent.emit(selectedItem);
  }

  onApprove = (selectedItem: any) => {
    this.approveEvent.emit(selectedItem);
  }

  onMigrate = (newServiceMrn: string) => {
    this.migrateEvent.emit({... this.selectedItem, newServiceMrn: newServiceMrn});
  }

  deleteItem = (selectedItem: any) => {
    this.deleteCall?.call(this, [selectedItem]);
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

  updateNumberOfElements = (event: any) => {
    const newElementsPerPage = parseInt(event.target.value.split(':').pop());
    if (this.elementsPerPage !== newElementsPerPage) {
      this.currentPageNumber = 0;
      this.elementsPerPage = newElementsPerPage;
      // Save the number of elements per page to localStorage
      localStorage.setItem('management-portal:elementsPerPage', this.elementsPerPage.toString());
      this.loadData();
    }
  }

  getItemTypeTitle = (itemType: ItemType) => {
    return itemTypeToString(itemType);
  }
}
