import { Component, Input } from '@angular/core';
import { ItemType } from 'src/app/common/menuType';
import { CertTableComponent } from '../cert-table/cert-table.component';
import { ColumnForResource } from 'src/app/common/columnForMenu';
import { mrnRegex } from 'src/app/common/mrnRegex';
import { Validators } from '@angular/forms';
import { sortColumnForMenu } from 'src/app/common/sortMenuOrder';
import { JsonPipe } from '@angular/common';
import { SharedModule } from 'src/app/common/shared/shared.module';

@Component({
  selector: 'app-item-view',
  standalone: true,
  imports: [
    SharedModule,
    CertTableComponent,
    JsonPipe,
  ],
  templateUrl: './item-view.component.html',
  styleUrl: './item-view.component.css'
})
export class ItemViewComponent {
  @Input() itemType: ItemType = ItemType.Device;
  @Input() item: any = {};

  viewContext = 'detail';
  columnForMenu: {[key: string]: any} = {};
  itemId = "";

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    
  }

  ngOnChanges(simpleChange: any) {
    this.item = simpleChange.item.currentValue && simpleChange.item.currentValue;
    if (Object.keys(this.item).length > 0) {
      this.itemId = this.item.mrn;
      this.setForm();
    }
  }

  setForm = () => {
    let formElements: {[key: string]: any} = {};
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
      
    });
  }

  sortColumnForMenu = (a: any, b: any) => {
    return sortColumnForMenu(a, b);
  }

  edit = () => {
    console.log('Edit');
  }
  
}
