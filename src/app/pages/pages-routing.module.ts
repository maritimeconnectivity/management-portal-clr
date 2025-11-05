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

import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PagesComponent } from './pages.component';
import { AboutComponent } from './about/about.component';
import { SrSearchComponent } from './sr-search/sr-search.component';
import { SrGuideComponent } from './sr-guide/sr-guide.component';
import { ListViewComponent } from './list-view/list-view.component';
import { DetailViewComponent } from './detail-view/detail-view.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { SrMapSearchComponent } from './sr-map-search/sr-map-search.component';

const routes: Routes = [
  {
  path: '',
  component: PagesComponent,
  children: [
    {
      path: '',
      component: DashboardComponent,
    },
    {
      path: 'ir/organization',
      component: ListViewComponent,
    },
    {
      path: 'ir/organization/:id',
      component: DetailViewComponent,
    },
    {
      path: 'ir/orgcandidate',
      component: ListViewComponent,
    },
    {
      path: 'ir/device',
      component: ListViewComponent,
    },
    {
      path: 'ir/device/:id',
      component: DetailViewComponent,
    },
    {
      path: 'ir/service',
      component: ListViewComponent,
    },
    {
      path: 'ir/service/:id/:instanceVersion',
      component: DetailViewComponent,
    },
    {
      path: 'ir/service/:id',
      component: DetailViewComponent,
    },
    {
      path: 'ir/user',
      component: ListViewComponent,
    },
    {
      path: 'ir/user/:id',
      component: DetailViewComponent,
    },
    {
      path: 'ir/vessel',
      component: ListViewComponent,
    },
    {
      path: 'ir/vessel/:id',
      component: DetailViewComponent,
    },
    {
      path: 'ir/role',
      component: ListViewComponent,
    },
    {
      path: 'ir/role/:id',
      component: DetailViewComponent,
    },
    {
      path: 'ir/guide',
      component: ListViewComponent,
    },
    {
      path: 'about',
      component: AboutComponent,
    },
    {
      path: 'sr/instance',
      component: ListViewComponent,
    },
    {
      path: 'sr/instance/:id',
      component: DetailViewComponent,
    },
    {
      path: 'sr/instance/:id/:instanceVersion',
      component: DetailViewComponent,
    },
    // {
    //   path: 'sr/mapsearch',
    //   component: SrMapSearchComponent,
    // },
    {
      path: 'sr/search',
      component: SrSearchComponent,
    },
    {
      path: 'sr/guide',
      component: SrGuideComponent,
    },
    { path: '', redirectTo: '', pathMatch: 'full' },
    {
      path: '**',
      component: NotFoundComponent,
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {
}