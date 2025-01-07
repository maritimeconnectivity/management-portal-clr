import { Component, ElementRef, ViewChild } from '@angular/core';
import { InputGeometryComponent } from "../../components/input-geometry/input-geometry.component";
import { ComponentsModule } from 'src/app/components/components.module';

@Component({
  selector: 'app-sr-search',
  standalone: true,
  imports: [
    InputGeometryComponent,
    ComponentsModule
  ],
  templateUrl: './sr-search.component.html',
  styleUrl: './sr-search.component.css'
})
export class SrSearchComponent {

}
