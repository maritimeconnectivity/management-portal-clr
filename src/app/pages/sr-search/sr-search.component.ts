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

@Component({
  selector: 'app-sr-search',
  standalone: true,
  imports: [
    InputGeometryComponent,
    ComponentsModule,
    SvcSearchInputComponent,
],
  templateUrl: './sr-search.component.html',
  styleUrl: './sr-search.component.css'
})
export class SrSearchComponent {
  @ViewChild('map')
  geometryMap!: InputGeometryComponent;
  @ViewChild('luceneQueryInputComponent') luceneQueryInputComponent!: SvcSearchInputComponent;
  queryGeometry: any = {};
  geometries: any[] = [];
  geometryNames: string[] = [];
  searchParams: SearchParameters = {};
  queryString = '';
  freetext = '';
  instances: SearchObjectResult[] = [];
  showTables = true;
  contextForAttributes = 'list';
  menuType = ItemType.Instance;
  isLoading = false;
  settings = {};
  mySettings = {
    actions: false,
    mode: 'external',
    delete: false,
    columns: ColumnForResource[this.menuType],
    hideSubHeader: true,
  };
  allInstances: InstanceDto[] = [];
  fieldInfo = srFieldInfo;

  constructor(
    private router: Router,
    private secomSearchController: SECOMService,
    private instanceControllerService: InstanceControllerService,
  ) { }

  ngOnInit(): void {
    if(ColumnForResource.hasOwnProperty(this.menuType.toString())) {
      this.mySettings.columns = Object.assign({}, ...
        Object.entries(ColumnForResource[this.menuType.toString()]).filter(([k,v]) => Array.isArray(v['visibleFrom']) && v['visibleFrom'].includes(this.contextForAttributes)).map(([k,v]) => ({[k]:v}))
      );
      this.settings = Object.assign({}, this.mySettings);

      this.instanceControllerService.getInstances().subscribe(
        instances => this.allInstances = instances,
      );
    }
  }

  onUpdateGeometry = (event: any) => {
    this.queryGeometry = event['data'];
    this.search(this.searchParams, geojsonToWKT(this.queryGeometry), this.freetext);
  }

  search = (searchParams: SearchParameters, wktString: string, freetext: string) => {
    this.isLoading = true;
    // send a query with given geometry, converted to WKT
    this.secomSearchController.search({query: searchParams, geometry: wktString, freetext: freetext })
    .subscribe(res => {
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
      this.geometryMap.loadGeometryOnMap();
    });
  }

  onSearch = () => {
    console.log(this.queryString);
    //this.search(this.searchParams, Object.keys(this.queryGeometry).length > 0 ? geojsonToWKT(this.queryGeometry) : '', this.freetext);
  }

  onQueryStringChanged = (event: any) => {
    this.queryString = event.target.value;
    if (this.queryString.length === 0) {
      this.clearAll();
    }
  }

  onClear = () => {
    this.geometries = [];
    this.queryGeometry = {};
    this.searchParams = {};
    this.clearAll();
  }

  clearAll = () => {
    this.clearMap();
    this.luceneQueryInputComponent?.clearInput();
  }

  clearMap = () => {
    this.geometries = [];
    this.geometryNames = [];
    this.geometryMap?.clearMap();
  }

  refreshData(data?: any) {
    if (data) {
      //this.source.load(data);
      if (data.length === 0) {
        this.clearMap();
      }
    } else {
      //this.source.load([]);
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
