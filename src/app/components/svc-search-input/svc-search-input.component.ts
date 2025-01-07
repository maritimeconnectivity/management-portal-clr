import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClrInputModule, ClrSelectModule } from '@clr/angular';

@Component({
  selector: 'app-svc-search-input',
  standalone: true,
  imports: [
    ClrSelectModule,
    FormsModule,
    ClrInputModule
  ],
  templateUrl: './svc-search-input.component.html',
  styleUrl: './svc-search-input.component.css'
})
export class SvcSearchInputComponent {
  selectedOption: any;
}
