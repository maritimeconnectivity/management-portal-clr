import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ClarityModule } from '@clr/angular';

@Component({
  selector: 'app-g1128-xml-input',
  standalone: true,
  imports: [
    ClarityModule,
  ],
  templateUrl: './g1128-xml-input.component.html',
  styleUrl: './g1128-xml-input.component.css'
})
export class G1128XmlInputComponent {
  @Input() isForNew = false;
  @Input() xmlContent = '';
  @Output() verify: EventEmitter<any> = new EventEmitter<any>();

  isVerified = false;

  onVerify() {
    this.verify.emit(this.xmlContent);
  }

  onSubmit() {

  }
  
}
