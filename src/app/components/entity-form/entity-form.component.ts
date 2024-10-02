import { Component, Input } from '@angular/core';
import { SharedModule } from '../../common/shared/shared.module';
import { ClrFormsModule } from '@clr/angular';
import { FormControl, FormsModule } from '@angular/forms';
import { ColumnForResource } from 'src/app/common/columnForMenu';
import { ResourceType } from 'src/app/common/menuType';

@Component({
  selector: 'app-entity-form',
  standalone: true,
  imports: [
    SharedModule,
    ClrFormsModule,
    FormsModule
  ],
  templateUrl: './entity-form.component.html',
  styleUrl: './entity-form.component.css'
})
export class EntityFormComponent {
  /**
   * menu type of an active page
   */
  @Input() menuType: ResourceType = ResourceType.Device;
  /**
   * a boolean indicating its use for creating entity
   */
  @Input() isForNew: boolean = false;

  model: FormControl | undefined;
  columnForMenu: {[key: string]: any} = {};
  isEditing = false;
  shortId = '';

  contextForAttributes = 'detail';

  submit = () => {
    console.log('Form submitted');
  }
  resetForm = () => {
    console.log('Form reset');
  }
  ngOnInit(): void {
    this.shortId = "Hello";
    this.setForm();
  }

  /**
   * creating a form taking given menu type account into
   */
  setForm = () => {
    Object.entries(ColumnForResource[this.menuType.toString()]).map(([key, value]) => {
      this.columnForMenu[key] = value;
      console.log(key, value);
      /*
      if (Array.isArray((value as any)['visibleFrom']) && // array type checking with type assertion
        (value as any)['visibleFrom'].includes(this.contextForAttributes) && // context filtering, either detail or list
        (!this.isEditing || (this.isForNew && (value as any)['notShowOnEdit'] !== true)))
        this.columnForMenu[key] = value;
        */
    }  
    );
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

  addShortIdToMrn = (field: string, shortId: string) => {
    /*
    const mrn = this.mrnHelperService.mrnMask( this.getShortIdType(field), this.orgShortId) + shortId;
    this.formGroup.get(field).setValue(mrn);
    if (field === 'orgMrn') {
      this.orgShortId = !this.orgShortId ? this.formGroup.get('orgMrn').value.split(":").pop():
        this.orgShortId;
      if (this.formGroup.get('adminMrn')) {
        const adminShortId = this.formGroup.get('adminMrn').value.split(":").pop();
        this.formGroup.get('adminMrn').setValue(this.mrnHelperService.mrnMaskForUserOfOrg(this.orgShortId) + adminShortId);
      }
    }
    */
  }
}
