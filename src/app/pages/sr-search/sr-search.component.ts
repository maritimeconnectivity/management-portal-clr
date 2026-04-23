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

import {AfterViewInit, Component, ViewChild, OnDestroy, OnInit} from '@angular/core';
import {InputGeometryComponent} from "../../components/input-geometry/input-geometry.component";
import {ComponentsModule} from 'src/app/components/components.module';
import {PasswordPromptModalComponent} from "../../components/password-prompt-modal/password-prompt-modal.component";
import {SvcSearchInputComponent} from "../../components/svc-search-input/svc-search-input.component";
import {SearchParameters} from 'src/app/backend-api/secom';
import {InstanceInfo, ItemType} from 'src/app/common/menuType';
import {ColumnForResource} from 'src/app/common/columnForMenu';
import {InstanceDto} from 'src/app/backend-api/service-registry';
import {Router} from '@angular/router';
import {ClarityModule} from '@clr/angular';
import {ItemManagerService} from 'src/app/common/shared/item-manager.service';
import {
    SmartExpandableTableComponent
} from 'src/app/components/smart-expandable-table/smart-expandable-table.component';
import {NotifierService} from 'gramli-angular-notifier';
import {TranslateService} from '@ngx-translate/core';
import {AuthService} from 'src/app/auth/auth.service';
import {loadLang} from 'src/app/common/translateHelper';
import {SecomSearchMapperService} from "../../common/shared/secomMapper.service";
import {
    SignaturePasswordRequest,
    SignatureProviderError,
    SignatureProviderErrorCode,
    CertificateProviderService
} from "../../common/shared/certificate-provider.service";
import {SecomSignerProvider} from "../../common/shared/secomSigning.service";

@Component({
    selector: 'app-sr-search',
    standalone: true,
    imports: [
        InputGeometryComponent,
        ComponentsModule,
        ClarityModule,
        PasswordPromptModalComponent,
        SvcSearchInputComponent,
    ],
    templateUrl: './sr-search.component.html',
    styleUrl: './sr-search.component.css'
})
export class SrSearchComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('map') geometryMap!: InputGeometryComponent;
    @ViewChild('queryInput') queryInput!: SvcSearchInputComponent;
    @ViewChild('exTable') smartTable!: SmartExpandableTableComponent;
    @ViewChild('passwordPrompt') passwordPrompt!: PasswordPromptModalComponent;
    queryGeometry: any = {};
    geometries: any[] = [];
    geometryBacklink: InstanceInfo[] = [];
    searchParams: SearchParameters = {};
    labels: Record<string, any> = {};
    freetext = '';
    orgMrn = "";
    totalPages = 0;
    totalElements = 0;
    itemType = ItemType.SearchObjectResult;
    isLoading = false;
    allInstances: InstanceDto[] = [];
    apiBase = 'sr';
    showPanel = false;
    selectedInstance: any = {};
    instanceType = ItemType.Instance;
    localOnly = true;
    globalSearchInProgress = false;
    remainingGlobalSearchCalls = 0;
    burstTimeouts: ReturnType<typeof setTimeout>[] = [];
    errorMessage: string | null = null;
    selectedInstanceIsLocal = false;
    msrAvailable = true;

    constructor(
        private router: Router,
        private itemManagerService: ItemManagerService,
        private notifier: NotifierService,
        private translate: TranslateService,
        private authService: AuthService,
        private secomSearchMapper: SecomSearchMapperService,
        private signatureServiceProvider: CertificateProviderService,
        private ssp: SecomSignerProvider
    ) {
        loadLang(translate);
    }

    ngOnInit(): void {
        this.authService.getOrgMrnFromToken().then(orgMrn => {
            this.orgMrn = orgMrn;
        });
        this.checkMsrConnection()
        this.setLabel();
    }

    ngAfterViewInit(): void {
        queueMicrotask(() => this.initializeCertificate());
    }

    private initializeCertificate(): void {
        this.signatureServiceProvider.getCertificate(this.requestCertificatePassword.bind(this))
            .then(cert => this.ssp.setSigningMaterial(
                {
                    bundle: cert!,
                    rootCertificateThumbprint: "a12d3d634ce384187b1a04ab5dd9c754fb6f2400dbdf561f0cf51793bc0d539b"
                }
            ))
            .catch(error => {
                if (error instanceof SignatureProviderError && error.code === SignatureProviderErrorCode.PasswordCancelled) {
                    this.notifier.notify(
                        'warning.signature.password_cancelled',
                        'Certificate unlock was cancelled because no password was provided.'
                    );
                    return;
                }

                if (error instanceof SignatureProviderError && error.code === SignatureProviderErrorCode.PasswordRequired) {
                    this.notifier.notify(
                        'warning.signature.password_required',
                        error.message
                    );
                    return;
                }

                if (error instanceof SignatureProviderError && error.code === SignatureProviderErrorCode.DecryptionFailed) {
                    this.notifier.notify(
                        'warning.signature.decryption_failed',
                        'Could not unlock the stored certificate. The password may be incorrect.'
                    );
                    return;
                }

                console.error('Could not initialize signature provider certificate', error);
            });
    }

    ngOnDestroy(): void {
        this.clearGlobalSearchTimers();
        this.passwordPrompt?.cancelPendingRequest();
    }

    private clearGlobalSearchTimers(): void {
        this.burstTimeouts.forEach(id => clearTimeout(id));
        this.burstTimeouts = [];
        this.remainingGlobalSearchCalls = 0;
        this.globalSearchInProgress = false;
    }

    requestCertificatePassword(request: SignaturePasswordRequest): Promise<string> {
        return this.passwordPrompt.open(request);
    }

    private async checkMsrConnection(): Promise<void> {
        const msrConnected = await this.itemManagerService.checkMsrAvailability();
        if (msrConnected) {
            this.msrAvailable = true;
        } else {
            this.msrAvailable = false;
            this.notifier.notify('warning.msr.unavailable', 'Maritime Service Registry is currently unavailable. Please try again later.');
        }

    }

    setLabel = () => {
        this.labels = this.filterVisibleForList(ColumnForResource[this.itemType.toString()]);
    }

    filterVisibleForList = (item: Record<string, any>) => {
        return Object.keys(item)
            .filter(key => item[key]?.visibleFrom?.includes('list'))
            .reduce((result, key) => {
                result[key] = item[key];
                return result;
            }, {} as Record<string, any>);
    };


    fetchData = async (itemType: ItemType, pageNumber: number, elementsPerPage: number, xactId: string | undefined) => {
        try {
            let fetchedItems;

            console.log(this.ssp.getSigningMaterial().bundle.certificate!)
            const minifiedPem = this.toMinifiedPemList(this.ssp.getSigningMaterial().bundle.certificate!);

            // Regular search service call
            if (!xactId) {
                const secomSearchFilterObj = this.secomSearchMapper.toSearchFilterObject({
                    scope: this.localOnly,
                    searchParams: this.searchParams,
                    geometry: Object.keys(this.queryGeometry).length > 0
                        ? JSON.stringify(this.queryGeometry)
                        : undefined,
                    certificates: minifiedPem,
                    thumbprint: this.ssp.getSigningMaterial().rootCertificateThumbprint
                });

                try {
                    fetchedItems = await this.itemManagerService.fetchListOfData(itemType, this.orgMrn, pageNumber, 100, secomSearchFilterObj);
                } catch (error) {
                    console.error('Error fetching items:', error);
                    this.notifier.notify('error.search.general', (error as any).message);
                    return [];
                }
            } else {
                console.log("Calling Retrieve Results")
                const secomRetrieveResultsObj = this.secomSearchMapper.toRetrieveResultsObj({
                    xactId: xactId,
                    certificates: minifiedPem,
                    thumbprint: this.ssp.getSigningMaterial().rootCertificateThumbprint
                })

                try {
                    fetchedItems = await this.itemManagerService.fetchListOfData(itemType, this.orgMrn, pageNumber, 100, undefined, secomRetrieveResultsObj);
                } catch (error) {
                    console.error('Error fetching items:', error);
                    this.notifier.notify('error.search.general', (error as any).message);
                    return [];
                }
            }

            //Construct the actual SECOM Request object

            if (!fetchedItems) {
                return [];
            }

            console.log('fetchedItems:', fetchedItems);

            this.totalPages = fetchedItems.totalPages!;
            this.totalElements = fetchedItems.totalElements!;
            this.geometries = [];
            this.geometryBacklink = [];
            fetchedItems.data?.forEach(i => {
                this.geometries.push(i.geometry);
                this.geometryBacklink.push({instanceId: i.instanceId, name: i.name, version: i.version});
            });

            //If globalsearch spawn three events that will fire
            const newXActId = fetchedItems.transactionId;
            if (newXActId && !this.localOnly) {
                this.scheduleGlobalSearchCalls(newXActId);
                console.log("Schedule global search calls");
            }


            return fetchedItems.data;
        } catch (error) {
            console.error('Error fetching data:', error);
            return [];
        }


    }

    private toMinifiedPemList(pemBundle: string): string[] {
        const matches = pemBundle.match(/-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/g);

        if (!matches) {
            return [];
        }

        return matches.map(cert =>
            cert
                .replace('-----BEGIN CERTIFICATE-----', '')
                .replace('-----END CERTIFICATE-----', '')
                .replace(/[\r\n\s]+/g, '')
        );
    }

    private scheduleGlobalSearchCalls(transactionId: string): void {
        // reset any existing timers / state
        this.clearGlobalSearchTimers();

        this.globalSearchInProgress = true;
        this.remainingGlobalSearchCalls = 3; // 3, 6, 10 seconds

        [3, 6, 10].forEach(seconds => {
            const id = setTimeout(async () => {
                try {
                    await this.smartTable.loadData(undefined, transactionId);
                } catch (error) {
                    console.error('Error during global search polling:', error);
                } finally {
                    this.remainingGlobalSearchCalls--;
                    if (this.remainingGlobalSearchCalls <= 0) {
                        this.globalSearchInProgress = false;
                    }
                }
            }, seconds * 1000);
            this.burstTimeouts.push(id);
        });
    }


    onUpdateGeometry = (event: any) => {
        // currently handling only one geometry
        this.queryGeometry = event['data']['geometries'][0];
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




  onSearch = (payload: { scope: 'local' | 'global'; searchParams: SearchParameters }) => {
        //Check empty params
        if (Object.keys(payload.searchParams).length === 0) {
            this.errorMessage = 'Please add at least one search parameter before searching.';
            return;
        }
        this.errorMessage = null;

        this.searchParams = payload.searchParams;
        if (this.geometryMap) {
            this.geometryMap.clearMap();
        }

        if (payload.scope === 'global') {
            this.localOnly = false;
        } else {
            this.localOnly = true;
            this.clearGlobalSearchTimers();
        }
        this.smartTable.loadData(undefined);
    }


    view = (selectedItem: any) => {
        this.itemManagerService
            .fetchSingleData(
                ItemType.Instance,
                this.orgMrn,
                selectedItem.instanceId,
                selectedItem.version
            )
            .then((instance) => {
                if (!instance || Object.keys(instance).length === 0) {
                    console.log('Instance fetch returned empty – treating as remote');
                    this.selectedInstance = selectedItem;
                    this.selectedInstanceIsLocal = false;
                    this.instanceType = ItemType.SearchObjectResult
                } else {
                    // Found in local MSR
                    this.selectedInstance = instance;
                    this.selectedInstanceIsLocal = true;
                    this.instanceType = ItemType.Instance;
                }
                this.showPanel = true;
            })
            .catch((err) => {
                console.warn('Error fetching instance locally – treating as remote', err);
                this.selectedInstance = selectedItem;
                this.selectedInstanceIsLocal = false;
                this.showPanel = true;
            });
    };

    moveToEditPage = (selectedItem: any, forEdit = true) => {
        const url = '/pages/' + this.apiBase + '/' + ItemType.Instance + '/' + selectedItem.instanceId + '/' + selectedItem.version;
        const urlTree = this.router.createUrlTree([url], {
            queryParams: {edit: forEdit}
        });
        this.router.navigateByUrl(urlTree);
    }

    onClear = () => {
        this.clearAll();

        this.clearGlobalSearchTimers();
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
                    {
                        queryParams: {
                            name: event.data.name,
                            version: event.data.instanceVersion,
                        }
                    });
            }
        }
    }
}
