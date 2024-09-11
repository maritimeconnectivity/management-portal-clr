import { Component } from '@angular/core';
import '@cds/core/icon/register.js';
import { ClarityIcons, userIcon } from '@cds/core/icon';

ClarityIcons.addIcons(userIcon);
@Component({
  selector: 'mp-layout',
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {

}
