import { Component, Input } from '@angular/core';
import { SmartTableComponent } from "../smart-table/smart-table.component";
import { ActiveCertificatesColumn, RevokedCertificatesColumn } from 'src/app/common/columnForCertificate';
import { ItemType } from 'src/app/common/menuType';

@Component({
  selector: 'app-cert-table',
  standalone: true,
  imports: [SmartTableComponent],
  templateUrl: './cert-table.component.html',
  styleUrl: './cert-table.component.css'
})
export class CertTableComponent {
  @Input() context: string = 'active';
  @Input() data: any[] = [];

  itemType: ItemType = ItemType.Certificate;
  onRevoke = (selected: any[]) => {
    console.log(selected);
  }

  onDownload = (selected: any[]) => {
    console.log(selected);
  }

  onAdd = () => {
    console.log('Add');
  }
  empty = [];

  columnsForActive = ActiveCertificatesColumn;
  columnsForRevoked = RevokedCertificatesColumn;
  
}
