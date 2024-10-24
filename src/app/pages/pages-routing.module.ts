import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

/*
import { PagesComponent } from './pages.component';
import { NotFoundComponent } from './miscellaneous/not-found/not-found.component';
import { AuthGuard } from '../auth/app.guard';
import { IrGuideComponent } from './identity-registry/ir-guide/ir-guide.component';
import { SrSearchComponent } from './service-registry/sr-search/sr-search.component';
import { SrGuideComponent } from './service-registry/sr-guide/sr-guide.component';
import { MsrLedgerSearchComponent } from './msr-ledger/msr-ledger-search/msr-ledger-search.component';
import { LedgerGuideComponent } from './msr-ledger/ledger-guide/ledger-guide.component';
import { AboutComponent } from './about/about.component';
*/
import { authGuard } from '../auth/auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PagesComponent } from './pages.component';
import { IrGuideComponent } from './ir-guide/ir-guide.component';
import { AboutComponent } from './about/about.component';
import { SrSearchComponent } from './sr-search/sr-search.component';
import { SrGuideComponent } from './sr-guide/sr-guide.component';
import { ListViewComponent } from './list-view/list-view.component';
import { DetailViewComponent } from './detail-view/detail-view.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { ItemType } from '../common/menuType';

const routes: Routes = [
  {
  path: '',
  component: PagesComponent,
  //canActivate: [authGuard],
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
    

    /*
    
    // identity registry
    {
      path: 'ir/devices',
      loadChildren: () => import('../shared/list-view/list-view.module')
        .then(m => m.ListViewModule),
    },
    {
      path: 'ir/services',
      loadChildren: () => import('../shared/list-view/list-view.module')
        .then(m => m.ListViewModule),
    },
    {
      path: 'ir/users',
      loadChildren: () => import('../shared/list-view/list-view.module')
        .then(m => m.ListViewModule),
    },
    {
      path: 'ir/vessels',
      loadChildren: () => import('../shared/list-view/list-view.module')
        .then(m => m.ListViewModule),
    },
    {
      path: 'ir/organizations',
      loadChildren: () => import('../shared/list-view/list-view.module')
        .then(m => m.ListViewModule),
    },
    {
      path: 'ir/apply-org',
      loadChildren: () => import('../shared/list-view/list-view.module')
        .then(m => m.ListViewModule),
    },
    {
      path: 'ir/orgcandidates',
      loadChildren: () => import('../shared/list-view/list-view.module')
        .then(m => m.ListViewModule),
    },
    {
      path: 'ir/acting',
      loadChildren: () => import('../shared/list-view/list-view.module')
        .then(m => m.ListViewModule),
    },
    {
      path: 'ir/roles',
      loadChildren: () => import('../shared/list-view/list-view.module')
        .then(m => m.ListViewModule),
    },
    {
      path: 'ir/agents',
      loadChildren: () => import('../shared/list-view/list-view.module')
        .then(m => m.ListViewModule),
    },
    
    // service registry
    {
      path: 'sr/instances',
      loadChildren: () => import('../shared/list-view/list-view.module')
        .then(m => m.ListViewModule),
    },
    {
      path: 'sr/instanceorg',
      loadChildren: () => import('../shared/list-view/list-view.module')
        .then(m => m.ListViewModule),
    },
    {
      path: 'sr/approve-svc',
      loadChildren: () => import('../shared/list-view/list-view.module')
        .then(m => m.ListViewModule),
    },
    
    {
      path: 'ledger/search',
      component: MsrLedgerSearchComponent,
    },
    {
      path: 'ledger/guide',
      component: LedgerGuideComponent,
    },
    
    {
      path: '',
      redirectTo: 'ir/guide',
      pathMatch: 'full',
    },
    {
      path: '**',
      component: NotFoundComponent,
    },
    */
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {
}