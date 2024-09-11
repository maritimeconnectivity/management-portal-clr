import { Component } from '@angular/core';
import { LayoutModule } from "../../layout/layout.module";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [LayoutModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  title = 'management-portal-clr';
}
