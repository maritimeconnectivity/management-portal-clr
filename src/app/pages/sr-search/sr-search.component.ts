import { Component, ElementRef, ViewChild } from '@angular/core';
import { InputGeometryComponent } from "../../components/input-geometry/input-geometry.component";
import { ComponentsModule } from 'src/app/components/components.module';
import { SvcSearchInputComponent } from "../../components/svc-search-input/svc-search-input.component";
import { SearchObjectResult, SearchParameters, SECOMService } from 'src/app/backend-api/secom';
import { InstanceInfo, ItemType } from 'src/app/common/menuType';
import { ColumnForResource } from 'src/app/common/columnForMenu';
import { InstanceControllerService, InstanceDto } from 'src/app/backend-api/service-registry';
import { LuceneQueryOutput } from 'src/app/common/lucene-query/lucene-query-output';
import { Router } from '@angular/router';
import { geojsonToWKT } from '@terraformer/wkt';
import { srFieldInfo } from 'src/app/common/lucene-query/service-registry-field-info';
import { ItemTableComponent } from 'src/app/components/item-table/item-table.component';
import { ClarityModule } from '@clr/angular';
import { ItemManagerService } from 'src/app/common/shared/item-manager.service';
import { SmartExpandableTableComponent } from 'src/app/components/smart-expandable-table/smart-expandable-table.component';
import { NotifierService } from 'gramli-angular-notifier';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/auth/auth.service';
import { loadLang } from 'src/app/common/translateHelper';

@Component({
  selector: 'app-sr-search',
  standalone: true,
  imports: [
    InputGeometryComponent,
    ComponentsModule,
    ClarityModule,
    SvcSearchInputComponent,
    ItemTableComponent,
],
  templateUrl: './sr-search.component.html',
  styleUrl: './sr-search.component.css'
})
export class SrSearchComponent {
  @ViewChild('map') geometryMap!: InputGeometryComponent;
  @ViewChild('queryInput') queryInput!: SvcSearchInputComponent;
  @ViewChild('exTable') smartTable!: SmartExpandableTableComponent;
  queryGeometry: any = {};
  geometries: any[] = [];
  geometryBacklink: InstanceInfo[] = [];
  searchParams: SearchParameters = {};
  labels: {[key: string]: any} = {};
  freetext = '';
  orgMrn: string = "";
  totalPages = 0;
  totalElements = 0;
  itemType = ItemType.SearchObjectResult;
  instances: SearchObjectResult[] = [];
  showTables = true;
  contextForAttributes = 'list';
  isLoading = false;
  settings = {};
  allInstances: InstanceDto[] = [];
  fieldInfo = srFieldInfo;
  apiBase = 'sr';
  showPanel = false;
  selectedInstance: any = {};
  instanceType = ItemType.Instance;

  constructor(
    private router: Router,
    private secomSearchController: SECOMService,
    private itemManagerService: ItemManagerService,
    private notifier: NotifierService,
    private translate: TranslateService,
    private authService: AuthService,
  ) {
    loadLang(translate);
  }

  ngOnInit(): void {
    this.authService.getOrgMrn().then(orgMrn => {
      this.orgMrn = orgMrn;
    });
    this.setLabel();
  }

  setLabel = () => {
    this.labels = this.filterVisibleForList(ColumnForResource[this.itemType.toString()]);
  }

  filterVisibleForList = (item: {[key: string]: any}) => {
    return Object.keys(item)
      .filter(key => item[key]?.visibleFrom?.includes('list'))
      .reduce((result, key) => {
        result[key] = item[key];
        return result;
      }, {} as {[key: string]: any});
  };

  fetchData = async (itemType: ItemType, pageNumber: number, elementsPerPage: number) => {
    try {
      const secomSearchParam = this.buildSearchParam(this.freetext, this.searchParams, Object.keys(this.queryGeometry).length > 0 ? JSON.stringify(this.queryGeometry) : ''); //geojsonToWKT(this.queryGeometry) : '');
      if (this.freetext === '' && Object.keys(this.searchParams).length === 0 && Object.keys(this.queryGeometry).length === 0) {
        return [];
      }
      // a bit of hack to deal with the fact that the search service does not support total number of elements....
      let fetchedItems;
      try {
        fetchedItems = await this.itemManagerService.fetchListOfData(itemType, this.orgMrn, pageNumber, 100, secomSearchParam);
      } catch (error) {
        console.error('Error fetching items:', error);
        this.notifier.notify('error.search.general', (error as any).message);
        return [];
      }
      if (!fetchedItems) {
        return [];
      }
      this.totalPages = fetchedItems.totalPages!;
      this.totalElements = fetchedItems.totalElements!;
      this.geometries = [];
      this.geometryBacklink = [];
      fetchedItems.data?.forEach(i =>
        {
          this.geometries.push(i.geometry);
          this.geometryBacklink.push({instanceId: i.instanceId, name: i.name, version: i.version});
        });
      return fetchedItems.data;
    } catch (error) {
      console.error('Error fetching data:', error);
      return [];
    }
  }

  buildSearchParam = (freetext: string, searchParams?: SearchParameters, geojsonString?: string): object => {
    const queryObject: any = { freetext: freetext };
    if (searchParams) {
      queryObject["query"] = searchParams;
    }
    if (geojsonString) {
      queryObject["geometry"] = geojsonString;
    }
    return queryObject;
  }

  onUpdateGeometry = (event: any) => {
    // currently handling only one geometry
    this.queryGeometry = event['data']['geometries'][0];
    this.smartTable.loadData();
    this.queryInput.addGeoItem();
  }

  onClearQueryGeometry = () => {
    this.queryGeometry = {};
    this.queryInput.deleteGeoItem();
  }

  onClearAll = () => {
    this.onClear();
    this.onClearQueryGeometry();
    this.geometryMap.clearMap();
  }

  search = (freetext: string, searchParams?: SearchParameters, geojsonString?: string) => {
    this.isLoading = true;
    const queryObject = this.buildSearchParam(freetext, searchParams, geojsonString);
    this.secomSearchController.search(queryObject).subscribe(res => {
      this.instances = res.searchServiceResult;
      this.refreshData(this.instances);
      this.isLoading = false;
      this.geometries = [];
      this.geometryBacklink = [];
      this.instances?.forEach(i =>
        {
          this.geometries.push(i.geometry);
          this.geometryBacklink.push({instanceId: i.instanceId, name: i.name, version: i.version});
        });
    });
  }

  onSearch = (freetext: string) => {
    this.freetext = freetext;
    if (this.geometryMap) {
      this.geometryMap.clearMap();
    }
    this.smartTable.loadData();
    //this.search(freetext, this.searchParams, Object.keys(this.queryGeometry).length > 0 ? geojsonToWKT(this.queryGeometry) : '');
  }

  view = (selectedItem: any) => {
    this.itemManagerService.fetchSingleData(this.instanceType, this.orgMrn, selectedItem.instanceId, selectedItem.version).then((instance) => {
      this.selectedInstance = instance;
      this.showPanel = true;
    });
  }

  moveToEditPage = (selectedItem: any, forEdit: boolean = true) => {
    const url = '/pages/' + this.apiBase + '/'+ItemType.Instance+'/'+selectedItem.instanceId + '/' + selectedItem.version;
    const urlTree = this.router.createUrlTree([url], {
      queryParams: { edit: forEdit }
    });
    this.router.navigateByUrl(urlTree);
  }

  onClear = () => {
    this.clearAll();
  }

  clearAll = () => {
    this.freetext = '';
    this.searchParams = {};
    this.clearMap();
    this.onClearQueryGeometry();
    this.searchParams = {};
    this.smartTable.clear();
  }

  clearMap = () => {
    this.geometries = [];
    this.geometryBacklink = [];
    this.geometryMap?.clearMap();
  }

  refreshData(data?: any) {
    if (data) {
      if (data.length === 0) {
        this.clearMap();
      } else {
        this.geometryMap.loadGeometryOnMap();
      }
    } else {
    }
  }

  onEdit(event: any): void {
    const mrn = event.data.instanceId;
    if (event && event.data && event.data.instanceId) {
      const instance = this.allInstances.filter((i) => i.instanceId === event.data.instanceId && i.version === event.data.version);
      if (instance.length) {
        this.router.navigate(['/pages/sr/instances',
        instance.pop()!.id],
          { queryParams: { name: event.data.name,
            version: event.data.instanceVersion,
          }});
      }
    }
  }
}
