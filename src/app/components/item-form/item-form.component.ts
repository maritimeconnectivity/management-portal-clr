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

import { JsonPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClarityModule, ClrForm, ClrFormsModule } from '@clr/angular';
import { ColumnForResource } from 'src/app/common/columnForMenu';
import { appendUpdatedAttributes, filterUndefinedAttributes } from 'src/app/common/filterObject';
import { ItemType } from 'src/app/common/menuType';
import { mrnRegex, mrnValidator } from 'src/app/common/mrnRegex';
import { SharedModule } from 'src/app/common/shared/shared.module';
import { CertTableComponent } from '../cert-table/cert-table.component';
import { Role, RoleControllerService } from 'src/app/backend-api/identity-registry';
import { AuthService } from 'src/app/auth/auth.service';
import { NotifierService } from 'gramli-angular-notifier';
import { TranslateService } from '@ngx-translate/core';
import { preprocess, preprocessToShow, preprocessToUpload } from 'src/app/common/itemPreprocessor';
import { FileHelperService } from 'src/app/common/shared/file-helper.service';
import { encodeFileToBase64 } from 'src/app/common/file-decoder';
import { DocDto, InstanceDto, XmlDto } from 'src/app/backend-api/service-registry';
import { ComponentsModule } from '../components.module';
import { InputGeometryComponent } from '../input-geometry/input-geometry.component';
import { mustIncludePatternValidator } from 'src/app/common/mustIncludeValidator';

@Component({
  selector: 'app-item-form',
  standalone: true,
  imports: [
    SharedModule,
    ClrFormsModule,
    FormsModule,
    ReactiveFormsModule,
    JsonPipe,
    CertTableComponent,
    ClarityModule,
    InputGeometryComponent,
  ],
  templateUrl: './item-form.component.html',
  styleUrl: './item-form.component.css'
})
export class ItemFormComponent {
  /**
     * menu type of an active page
     */
  @Input() itemType: ItemType = ItemType.None;
  /**
   * a boolean indicating its use for creating entity
   */
  @Input() isForNew: boolean = false;

  @Input() item: any = {};

  /**
   * an mrn of organization owning the chosen entity
   */
  @Input() mrnPrefix: string = 'urn:mrn:';

  @Input() title: string = '';

  @Input() orgMrn: string = '';

  @Input() isVerified = false;

  @Input() hasEditPermission = false;

  @Input() roles: Role[] = [];

  @Input() keysToFilter: string[] = [];

  @Output() cancelEvent: EventEmitter<any> = new EventEmitter<any>();

  @Output() submitEvent: EventEmitter<any> = new EventEmitter<any>();

  @Output() verifyEvent: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild(ClrForm, { static: true }) clrForm: ClrForm | undefined;
  @ViewChild('map') geometryMap!: InputGeometryComponent;

  viewContext = 'edit';

  itemForm: FormGroup = new FormGroup({});
  columnForMenu: { [key: string]: any } = {};
  isEditing = false;
  id = '';
  onSubmitIsGiven = true;
  docToBeDeleted: DocDto | undefined;
  xmlToBeDeleted: XmlDto | undefined;
  isXmlEditorEnabled = false;
  geometry: any[] = [];
  isXmlVerified = false;

  constructor(private formBuilder: FormBuilder,
    private notifierService: NotifierService,
    private translate: TranslateService,
    private fileHelperService: FileHelperService,
  ) {
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    if (this.itemType === ItemType.OrgCandidate) {
      this.hasEditPermission = true;
    }
    this.prepareItem(this.itemType);
  }

  ngOnChanges(simpleChange: any) {
    if (this.isForNew) {
      this.viewContext = 'edit-new';
      if (this.item && Object.keys(this.item).length === 0) {
        this.initializeItem();
      }
      if (this.itemType === ItemType.Instance) {
        this.formatInstanceItem();
      }
    }
    if (this.itemType !== ItemType.None) {
      this.setForm();
      if (Object.keys(this.item).length !== 0) {
        if (this.itemType === ItemType.Instance) {
          this.formatInstanceItem();
        }
        this.itemForm.patchValue(this.item);
      }
    }
    if (this.title.length === 0 && this.itemType !== ItemType.None) {
      if (this.isForNew) {
        this.title = 'New ' + this.capitalize(this.itemType);
      } else {
        this.title = 'Edit ' + this.capitalize(this.itemType);
      }
    }
    // Check if onSubmit is given
    if (this.submitEvent.observers.length !== 0) {
      this.onSubmitIsGiven = true;
    } else {
      this.onSubmitIsGiven = false;
    }
  }

  formatInstanceItem = () => {
    this.item = preprocessToShow(this.item, this.itemType);
    if (this.geometryMap) {
      this.geometryMap.clearMap();
    }
    this.geometry = [this.item.geometry];
    if (this.item.instanceAsXml && (!this.item.instanceAsXmlName || this.item.instanceAsXmlName.length === 0)) {
      this.item.instanceAsXmlName = this.item.instanceAsXml.content.replace(/\\n/g, '').replace(/\\r/g, '').replace(/\\"/g, '"');
    }
    this.item = {...this.item, organizationId: this.orgMrn};
  }

  initializeItem = () => {
    if (this.itemType === ItemType.Instance) {
      this.item = {instanceId: this.mrnPrefix, organizationId: this.orgMrn, status: 'PROVISIONAL'};
    } else {
      this.item = {mrn: this.mrnPrefix};
    }
  }

  submit = async () => {
    // Filter attributes with undefined values
    if (this.isValid()){
      let filteredAttributes: any = filterUndefinedAttributes(this.itemForm.value);
      if (this.isForNew) {
        if (this.itemType === ItemType.Instance) {
          // the document should be uploaded before submitting
          if (this.item.instanceAsDoc) { // this means there is an update
            const result = await this.fileHelperService.uploadDoc(this.item.instanceAsDoc);
            filteredAttributes.instanceAsDoc = result;
          }
          if (this.item.instanceAsXml) { // this means there is an update
            const result = await this.fileHelperService.uploadXml(this.item.instanceAsXml);
            filteredAttributes.instanceAsXml = result;
          }
          if (this.item.geometry) {
            filteredAttributes.geometry = this.item.geometry;
          }
        }
        this.submitEvent.emit(preprocessToUpload(filteredAttributes, this.itemType));
      } else {
        const updated = appendUpdatedAttributes(this.item, filteredAttributes, this.columnForMenu);
        let preprocessSuccess = true;
        // the document should be uploaded before submitting
        if (this.item.instanceAsDoc && this.item.instanceAsDocName.length === 0) { // this means there is an update
          const result = await this.fileHelperService.uploadDoc(this.item.instanceAsDoc);
          this.item.instanceAsDoc = result;
          preprocessSuccess = result ? true : false;
        } else if (this.docToBeDeleted) { // this means the document should be deleted
          // preprocessSuccess = await this.fileHelperService.deleteDoc(this.docToBeDeleted!.id!);
          this.item.instanceAsDoc = null;
        }

        if (this.item.instanceAsXml && this.item.instanceAsXmlName.length === 0) { // this means there is an update
          const result = await this.fileHelperService.uploadXml(this.item.instanceAsXml);
          this.item.instanceAsXml = result;
          preprocessSuccess = result ? true : false;
        } else if (this.xmlToBeDeleted) { // this means the document should be deleted
          // preprocessSuccess = await this.fileHelperService.deleteXml(this.xmlToBeDeleted!.id!);
          this.item.instanceAsXml = null;
        }

        if (preprocessSuccess) {
          this.submitEvent.emit(preprocessToUpload(updated, this.itemType));
        }
      }
    }
  }

  prepareItem = (itemType: ItemType) => {
    if (itemType === ItemType.Instance) {
      this.item = {
        comment: "",
        instanceAsDoc: null,
        geometryContentType: null,
        specifications: {},
        geometryJson: {},
        instanceAsXml: null,
        name: "",
        version: "",
        serviceType: [],
        dataProductType: [],
        status: "",
        endpointUri: "",
        organizationId: "",
        keywords: [],
        instanceId: "",
        implementsServiceDesign: "",
        implementsServiceDesignVersion: "",
        lastUpdatedAt: ""
      };
    }
  }

  isValid = (): boolean => {
    if (!this.itemForm.valid) {
      this.itemForm.markAllAsTouched();
      this.clrForm?.markAsTouched();
      this.notifierService.notify('error', this.translate.instant('error.form.invalid'));
      return false;
    }
    if (this.itemForm.value.mrn === this.mrnPrefix) {
      this.notifierService.notify('error', this.translate.instant('error.form.invalidmrn'));
      return false;
    }
    return true;
  }

  getFormValue = () => {
    if (this.isValid()) {
      let formValue = this.itemForm.value;
      return filterUndefinedAttributes(formValue);
    } else
    return undefined;
  }

  resetForm = () => {
    this.setForm();
    if (!this.isForNew) {
      this.itemForm.patchValue(this.item);
    } else if (this.itemType !== ItemType.Role) {
      this.initializeItem();     
      this.itemForm.patchValue(this.item);
    }
  }

  cancel = () => {
    this.cancelEvent.emit();
  }

  onMrnKeyDown(event: KeyboardEvent) {
    const newValue = (event.target as HTMLInputElement).value;
    if (newValue.includes(this.mrnPrefix)) {
      this.item['mrn'] = newValue;
    } else {
      (event.target as HTMLInputElement).value = this.mrnPrefix;
    }
    this.itemForm.patchValue(this.item);
  }

  onMrnChange(value: string) {
    if (!value.startsWith(this.mrnPrefix)) {
      this.item.mrn = this.mrnPrefix;
    } else {
      this.item.mrn = value;
    }
  }

  /**
   * creating a form taking given menu type account into
   */
  setForm = () => {
    let formElements: { [key: string]: any } = {};
    Object.entries(ColumnForResource[this.itemType.toString()]).map(([key, value]) => {
      if (this.keysToFilter.length > 0 && this.keysToFilter.includes(key)) {
        return;
      }
      if (!value.visibleFrom)
        return;
      if (value.visibleFrom && !value.visibleFrom.includes(this.viewContext))
        return;
      if ( key === 'mrn') {
        formElements[key] = ['', [Validators.required, mustIncludePatternValidator( new RegExp(this.mrnPrefix, 'i'))]];
      } else if ( key === 'instanceId' || key === 'subsidaryMrn') {
        formElements[key] = ['', [Validators.required, mrnValidator()]];
      } else if (key === 'email') {
        formElements[key] = ['', [Validators.required, Validators.email]];
      } else if (key === 'url') {
        const urlReg = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';
        formElements[key] = ['', [Validators.required, Validators.pattern(urlReg)]];
      } else if (key === 'instanceAsDoc' || key === 'instanceAsXml') {
        formElements[key] = ['', value.required ? Validators.required : undefined];
      } else {
        formElements[key] = ['', value.required ? Validators.required : undefined];
      }
      this.columnForMenu[key] = value;
    });
    this.itemForm = this.formBuilder.group(formElements);
  }

  /**
   * a function returning whether the resource type requires short ID or not
   * @param resourceType type of resource
   * @returns whether the resource type requires short ID or not
   */
  needShortId = (resourceType: string) => {
    return this.getShortIdType(resourceType) !== undefined;
  }

  /**
   * a function fetching its short ID
   * @param resourceType type of resource
   * @returns whether the resource type requires short ID or not
   */
  getShortIdType = (resourceType: string) => {
    return this.columnForMenu[resourceType] ? this.columnForMenu[resourceType].shortIdType : undefined;
  }

  sortColumnForMenu = (a: any, b: any) => {
    return a.order > b.order ? -1 : 1;
  }

  capitalize = (s: string): string => s[0].toUpperCase() + s.slice(1);
 
  onFileChange = (event: any, key: string) => {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      encodeFileToBase64(file).then((result: { file: File, content: string }) => {
        if (key === 'instanceAsDocName') {
          this.item.instanceAsDoc = {
            name: result.file.name,
            comment: "",
            mimetype: result.file.type,
            filecontent: result.content,
            filecontentContentType: result.file.type,
            instanceId: this.item.id
          };
          this.item.instanceAsDocName = '';
        } else if (key === 'instanceAsXmlName') {
          alert("xml compliance checker is not implemented yet");
        }
      });
    }

  }
  downloadFile = (key: string) => {
    if (key === 'instanceAsDocName') {
      this.fileHelperService.downloadDoc(this.item.instanceAsDoc);
    } else if (key === 'instanceAsXmlName') {
      this.fileHelperService.downloadXml(this.item.instanceAsXml);
    }
  }

  deleteFile = async (key: string) => {
    if (key === 'instanceAsDocName' && this.item.instanceAsDoc) {
      if (this.item.instanceAsDocName === '') {
        // this is for deletion of file, which hasn't been uploaded yet
        this.docToBeDeleted = this.item.instanceAsDoc;
        this.item.instanceAsDoc = null;
        this.item.instanceAsDocName = '';
      }
      
    } else if (key === 'instanceAsXmlName' && this.item.instanceAsXml) {
      if (this.item.instanceAsXmlName === '') {
        // this is for deletion of file, which hasn't been uploaded yet
        this.xmlToBeDeleted = this.item.instanceAsXml;
        this.item.instanceAsXml = null;
        this.item.instanceAsXmlName = '';
      }
    }
  }

  shortenFileName = (fileName: string, maxLength: number): string => {
    // Find the last dot to get the file extension
    const lastDotIndex = fileName.lastIndexOf('.');
    if (lastDotIndex === -1) {
      // If there's no dot, return the original fileName
      return fileName;
    }
  
    // Extract the file extension
    const extension = fileName.substring(lastDotIndex);
    // Extract the main part of the file name
    const mainPart = fileName.substring(0, lastDotIndex);
  
    // Check if the main part needs to be shortened
    if (mainPart.length <= maxLength) {
      return fileName;
    }
  
    // Shorten the main part and add ellipsis
    const shortenedMainPart = mainPart.substring(0, maxLength) + '..';
  
    // Combine the shortened main part with the file extension
    return shortenedMainPart + extension;
  }

  setGeometryInput = (geometry: any) => {
    if (this.itemType === ItemType.Instance) {
      this.item.geometry = geometry.data.geometries[0];
    }
  }

  setXmlEditor = () => {
    this.isXmlEditorEnabled = !this.isXmlEditorEnabled;
  }
  
  onVerify = () => {
    if (!this.itemForm.value['instanceAsXmlName'] || this.itemForm.value['instanceAsXmlName'].length === 0) {
      this.notifierService.notify('error', this.translate.instant('error.form.emptyXml'));
      return;
    }
    this.verifyEvent.emit(this.itemForm.value['instanceAsXmlName']);
  }

}
