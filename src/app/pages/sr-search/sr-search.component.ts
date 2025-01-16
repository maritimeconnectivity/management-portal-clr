import { Component, ElementRef, ViewChild } from '@angular/core';
import { InputGeometryComponent } from "../../components/input-geometry/input-geometry.component";
import { ComponentsModule } from 'src/app/components/components.module';
import { SvcSearchInputComponent } from "../../components/svc-search-input/svc-search-input.component";
import { SearchObjectResult, SearchParameters, SECOMService } from 'src/app/backend-api/secom';
import { ItemType } from 'src/app/common/menuType';
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
  geometryNames: string[] = [];
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

  constructor(
    private router: Router,
    private secomSearchController: SECOMService,
    private instanceControllerService: InstanceControllerService,
    private itemManagerService: ItemManagerService,
  ) { }

  ngOnInit(): void {
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
      const fetchedItems = await this.itemManagerService.fetchListOfData(itemType, this.orgMrn, pageNumber, 100, secomSearchParam);
      if (!fetchedItems) {
        return [];
      }
      this.totalPages = fetchedItems.totalPages!;
      this.totalElements = fetchedItems.totalElements!;
      this.geometries = [];
      this.geometryNames = [];
      fetchedItems.data?.forEach(i =>
        {
          this.geometries.push(i.geometry);
          this.geometryNames.push(i.name);
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
      this.geometryNames = [];
      this.instances?.forEach(i =>
        {
          this.geometries.push(i.geometry);
          this.geometryNames.push(i.name);
        });
    });
  }

  onSearch = (freetext: string) => {
    this.freetext = freetext;
    this.smartTable.loadData();
    //this.search(freetext, this.searchParams, Object.keys(this.queryGeometry).length > 0 ? geojsonToWKT(this.queryGeometry) : '');
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
    this.geometryNames = [];
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
