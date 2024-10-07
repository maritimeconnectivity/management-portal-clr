import { Component } from '@angular/core';
import { SmartTableComponent } from "../smart-table/smart-table.component";

@Component({
  selector: 'app-cert-table',
  standalone: true,
  imports: [SmartTableComponent],
  templateUrl: './cert-table.component.html',
  styleUrl: './cert-table.component.css'
})
export class CertTableComponent {
  onRevoke = (selected: any[]) => {
    console.log(selected);
  }

  onDownload = (selected: any[]) => {
    console.log(selected);
  }

  onAdd = () => {
    console.log('Add');
  }
}
