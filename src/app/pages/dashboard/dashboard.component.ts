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
        this.authService.getOrgMrn().then(mrn => {
            this.orgMrn = mrn;
            this.isLoading = false;
        });
    }
}
