import {Component, OnInit} from '@angular/core';
import {LayoutModule} from "../../layout/layout.module";
import {Organization, OrganizationControllerService} from "../../backend-api/identity-registry";
import {LabelValueModel, LabelValueTableComponent} from "../../common/label-value-table/label-value-table.component";

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [LayoutModule, LabelValueTableComponent],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
    title = 'a fancy dashboard';
    isLoading: boolean = false;
    organization?: Organization;
    labelValues?: LabelValueModel[];

    constructor(private organizationService: OrganizationControllerService) {
        this.isLoading = true;
    }

    ngOnInit() {
        this.organizationService.getOrganization().subscribe(orgsPage => {
            if (orgsPage.content?.length) {
                const org = orgsPage.content[0];
                this.organization = org;
                const labelValues: LabelValueModel[] = [];
                labelValues.push({label: "Name", value: org.name});
                labelValues.push({label: "MRN", value: org.mrn});
                labelValues.push({label: "Email", value: org.email, isEmail: true});
                labelValues.push({label: "URL", value: org.url, isLink: true});
                this.labelValues = labelValues;
                this.isLoading = false;
            }
        })
    }
}
