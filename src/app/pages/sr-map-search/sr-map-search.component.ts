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
import { ClarityModule } from '@clr/angular';
import { ItemManagerService } from 'src/app/common/shared/item-manager.service';
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
    SvcSearchInputComponent,
    ClarityModule,
],
  templateUrl: './sr-map-search.component.html',
  styleUrl: './sr-map-search.component.css'
})
export class SrMapSearchComponent {
  @ViewChild('map') geometryMap!: InputGeometryComponent;
  @ViewChild('queryInput') queryInput!: SvcSearchInputComponent;
  queryGeometry: any = {};
  showPanel = false;
  geometries: any[] = [];
  geometryBacklink: InstanceInfo[] = [];
  searchParams: SearchParameters = {};
  queryString = '';
  freetext = '';
  orgMrn = "";
  instances: SearchObjectResult[] = [];
  itemType = ItemType.SearchObjectResult;
  showTables = true;
  contextForAttributes = 'list';
  isLoading = false;
  allInstances: InstanceDto[] = [];
  fieldInfo = srFieldInfo;
  selectedInstances: InstanceDto[] = [];
  instanceType = ItemType.Instance;
  apiBase = 'sr';

  constructor(
    private router: Router,
    private itemManagerService: ItemManagerService,
    private notifier: NotifierService,
    private translate: TranslateService,
    private authService: AuthService,
    ) {
      loadLang(translate);
    }
  
    ngOnInit(): void {
      this.authService.getOrgMrnFromToken().then(orgMrn => {
        this.orgMrn = orgMrn;
      });
  }

  onUpdateGeometry = (event: any) => {
    // currently handling only one geometry
    this.queryGeometry = event['data']['geometries'][0];
    this.queryInput.addGeoItem();
    this.search(this.freetext, this.searchParams);
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

   onSearch = (payload: { scope: 'local' | 'global'; queryString: string }) => {
    this.freetext = payload.queryString;


    console.debug("Params are")

    console.debug(this.searchParams);

    console.debug("Freetext is")

    console.debug(this.freetext);

    this.search(this.freetext, this.searchParams);
  }

  search = async (freetext: string, searchParams?: SearchParameters) => {
    const secomSearchParam = this.buildSearchParam(this.freetext, this.searchParams, Object.keys(this.queryGeometry).length > 0 ? JSON.stringify(this.queryGeometry) : ''); //geojsonToWKT(this.queryGeometry) : '');
      if (this.freetext === '' && Object.keys(this.searchParams).length === 0 && Object.keys(this.queryGeometry).length === 0) {
        return;
      }
    let fetchedItems;
      try {
        fetchedItems = await this.itemManagerService.fetchListOfData(ItemType.SearchObjectResult, "", 0, 100, secomSearchParam);
      } catch (error) {
        console.error('Error fetching items:', error);
        this.notifier.notify('error.search.general', (error as any).message);
        return;
      }
      if (!fetchedItems) {
        return;
      }
      this.geometries = [];
      this.geometryBacklink = [];

      console.log("Fetched number of items: " + fetchedItems.data?.length);
      fetchedItems.data?.forEach(i =>
        {
          this.geometries.push(i.geometry);
          this.geometryBacklink.push({instanceId: i.instanceId, name: i.name, version: i.version});
        });
      this.geometryMap.loadGeometryOnMap();
  }


  onQueryStringChanged = (event: any) => {
    this.queryString = event.target.value;
    if (this.queryString.length === 0) {
      this.clearAll();
    }
  }

  clearAll = () => {
    this.searchParams = {};
    this.clearMap();
    this.onClearQueryGeometry();
    this.queryInput?.clearInputOnly();
    this.selectedInstances = [];
  }

  onClearQueryGeometry = () => {
    this.queryGeometry = {};
    this.queryInput.deleteGeoItem();
  }

  clearMap = () => {
    this.geometries = [];
    this.geometryBacklink = [];
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

  showInstanceInfo = (event: InstanceInfo[]) => {
    this.showPanel = true;
    this.selectedInstances = [];
    event.forEach((i) => {
      this.itemManagerService.fetchSingleData(this.instanceType, "", i.instanceId, i.version).then((instance) => {
        this.selectedInstances.push(instance);
      });
    });
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

  moveToEditPage = (selectedItem: any, forEdit: boolean = true) => {
    const url = '/pages/' + this.apiBase + '/'+ItemType.Instance+'/'+selectedItem.instanceId + '/' + selectedItem.version;
    const urlTree = this.router.createUrlTree([url], {
      queryParams: { edit: forEdit }
    });
    this.router.navigateByUrl(urlTree);
  }

  onClearAll = () => {
    this.clearAll();
  }
}
