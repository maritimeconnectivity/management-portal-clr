import { Component, EventEmitter, Input, Output } from '@angular/core';
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
  @Input() serial: string | undefined;
  @Output() onAdd:EventEmitter<any> = new EventEmitter<any>();
  @Output() onDownload:EventEmitter<any[]> = new EventEmitter<any[]>();
  @Output() onRevoke:EventEmitter<any[]> = new EventEmitter<any[]>();

  itemType: ItemType = ItemType.Certificate;

  download = (selected: any[]) => {
    this.onDownload.emit(selected);
  }

  add = () => {
    this.onAdd.emit();
  }

  revoke = (selected: any[]) => {
    this.onRevoke.emit(selected);
  }
  empty = [];

  columnsForActive = ActiveCertificatesColumn;
  columnsForRevoked = RevokedCertificatesColumn;
  
}
