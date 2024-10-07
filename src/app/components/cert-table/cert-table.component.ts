import { Component, Input } from '@angular/core';
import { SmartTableComponent } from "../smart-table/smart-table.component";
import { ActiveCertificatesColumn, RevokedCertificatesColumn } from 'src/app/common/columnForCertificate';

@Component({
  selector: 'app-cert-table',
  standalone: true,
  imports: [SmartTableComponent],
  templateUrl: './cert-table.component.html',
  styleUrl: './cert-table.component.css'
})
export class CertTableComponent {
  @Input() context: string = 'active';

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
  
  data = [
    {
      id: 1,
      name: 'John',
      email: '',
      age: 30
    },
    {
      id: 2,
      name: 'Doe',
      email: '',
      age: 25
    },
    {
      id: 3,
      name: 'Jane',
      email: '',
      age: 28
    },
    {
      id: 4,
      name: 'Alice',
      email: '',
      age: 24
    },
    {
      id: 5,
      name: 'Bob',
      email: '',
      age: 23
    }
  ];
}
