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

import {Component, OnInit} from '@angular/core';
import {LayoutModule} from "../../layout/layout.module";
import {Organization, OrganizationControllerService} from "../../backend-api/identity-registry";
import {LabelValueModel, LabelValueTableComponent} from "../../common/label-value-table/label-value-table.component";
import { CertChartComponent } from "../../components/cert-chart/cert-chart.component";
import { ClrTabsModule } from '@clr/angular';
import { ItemtypeOverviewComponent } from 'src/app/components/itemtype-overview/itemtype-overview.component';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [LayoutModule, LabelValueTableComponent, CertChartComponent, ClrTabsModule, ItemtypeOverviewComponent],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
    title = 'Dashboard';
    isLoading: boolean = false;
    organization?: Organization;
    labelValues?: LabelValueModel[];
    orgMrn = "";

    constructor(private organizationService: OrganizationControllerService,
        private authService: AuthService
    ) {
        this.isLoading = true;
    }

    ngOnInit() {
        this.authService.getOrgMrnFromToken().then(mrn => {
            this.orgMrn = mrn;
            this.isLoading = false;
        });
    }
}
