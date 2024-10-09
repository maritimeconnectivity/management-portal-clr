import { JsonPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClrForm, ClrFormsModule } from '@clr/angular';
import { ColumnForResource } from 'src/app/common/columnForMenu';
import { filterUndefinedAttributes } from 'src/app/common/filterObject';
import { ItemType } from 'src/app/common/menuType';
import { mrnRegex } from 'src/app/common/mrnRegex';
import { SharedModule } from 'src/app/common/shared/shared.module';
import { CertTableComponent } from '../cert-table/cert-table.component';

@Component({
  selector: 'app-item-form',
  standalone: true,
  imports: [
    SharedModule,
    ClrFormsModule,
    FormsModule,
    ReactiveFormsModule,
    JsonPipe,
    CertTableComponent
  ],
  templateUrl: './item-form.component.html',
  styleUrl: './item-form.component.css'
})
export class ItemFormComponent {
  /**
     * menu type of an active page
     */
  @Input() itemType: ItemType = ItemType.Device;
  /**
   * a boolean indicating its use for creating entity
   */
  @Input() isForNew: boolean = false;

  @Input() item: any = {};

  /**
   * an mrn of organization owning the chosen entity
   */
  @Input() mrnPrefix: string = 'urn:mrn:';

  @Output() onCancel: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild(ClrForm, { static: true }) clrForm: ClrForm | undefined;

  viewContext = 'edit';

  itemForm: FormGroup = new FormGroup({});
  columnForMenu: { [key: string]: any } = {};
  isEditing = false;
  shortId = '';
  id = '';

  constructor(private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.setForm();
    this.itemForm.patchValue(this.item);
    this.shortId = "Hello";
  }

  ngOnChanges(simpleChange: any) {
    this.setForm();
    this.itemForm.patchValue(this.item);
  }

  submit = () => {
    // Filter attributes with undefined values
    if (!this.itemForm.valid) {
      this.itemForm.markAllAsTouched();
      this.clrForm?.markAsTouched();
    }
    const filteredAttributes = filterUndefinedAttributes(this.item);
  }
  resetForm = () => {
    this.setForm();
  }

  cancel = () => {
    this.onCancel.emit();
  }

  onMrnKeyDown(event: Event) {
    const newValue = (event.target as HTMLInputElement).value;
    if (newValue.includes(this.mrnPrefix)) {
      this.item['mrn'] = newValue;
    } else {
      (event.target as HTMLInputElement).value = this.mrnPrefix;
    }
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
      if (!value.visibleFrom)
        return;
      if (value.visibleFrom && !value.visibleFrom.includes(this.viewContext))
        return;
      if (key === 'mrn') {
        const mrnReg: RegExp = new RegExp(mrnRegex());
        formElements[key] = ['', [Validators.required, Validators.pattern(mrnReg)]];
      } else {
        formElements[key] = ['', value.required ? Validators.required : undefined];
      }
      this.columnForMenu[key] = value;

      /*
      if (Array.isArray((value as any)['visibleFrom']) && // array type checking with type assertion
        (value as any)['visibleFrom'].includes(this.contextForAttributes) && // context filtering, either detail or list
        (!this.isEditing || (this.isForNew && (value as any)['notShowOnEdit'] !== true)))
        this.columnForMenu[key] = value;
        */
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

  private updateEntity(values: any) {
    Object.assign(this.item, values);
  }
}
