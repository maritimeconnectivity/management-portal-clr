import { Component } from '@angular/core';
import { MENU_ITEMS } from 'src/app/pages/pages-menu';

@Component({
  selector: 'mp-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  navGroups = MENU_ITEMS;
}
