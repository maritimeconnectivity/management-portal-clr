import { Component } from '@angular/core';
import { SmartTableComponent } from "../../components/smart-table/smart-table.component";
import { ComponentsModule } from 'src/app/components/components.module';

@Component({
  selector: 'app-list-view',
  standalone: true,
  imports: [
    ComponentsModule,
    SmartTableComponent],
  templateUrl: './list-view.component.html',
  styleUrl: './list-view.component.css'
})
export class ListViewComponent {
  columns = ["MRN", "Name", "Updated At"];
  data = [
    { mrn: "urn:mrn:mcp:device:mcc:core:syncer", name: "Sync Device", updatedAt: "2020-11-16 12:31:40" },
    { mrn: "urn:mrn:mcp:device:mcc:core:test-device", name: "Test Device", updatedAt: "2021-12-10 10:52:06" },
    { mrn: "urn:mrn:mcp:device:mcc:core:new", name: "New", updatedAt: "2022-05-05 14:09:16" },
    { mrn: "urn:mrn:mcp:device:mcc:core:k-er", name: "Korea Edge Router", updatedAt: "2023-09-26 14:11:31" },
    { mrn: "urn:mrn:mcp:device:mcc:core:test", name: "Test Device", updatedAt: "2023-12-15 12:24:24" },
    { mrn: "urn:mrn:mcp:device:mcc:core:eu-er", name: "EU Edge Router", updatedAt: "2024-01-31 14:06:04" },
    { mrn: "urn:mrn:mcp:device:mcc:core:dmcsmmpaga", name: "DMC-SMMP-Agent-A", updatedAt: "2024-05-29 14:00:15" },
    { mrn: "urn:mrn:mcp:device:mcc:core:ecdis-test-001", name: "ECDIS test 001", updatedAt: "2024-06-26 06:28:42" },
    { mrn: "urn:mrn:mcp:device:mcc:core:aivnappagent", name: "AIVN-APP-AGENT", updatedAt: "2024-07-22 07:22:18" },
    { mrn: "urn:mrn:mcp:device:mcc:core:dmcsmmpagb", name: "DMC-SMMP-Agent-B", updatedAt: "2024-07-25 11:57:20" }
  ];
  
  onDelete = (selected: any[]) => {
    console.log(selected);
  }

  onAdd = () => {
    console.log("Add");
  }
}
