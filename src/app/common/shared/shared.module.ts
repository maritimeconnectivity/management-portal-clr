import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';



@NgModule({
  imports: [ CommonModule ],
  declarations: [],
  exports: [
    CommonModule,
    TranslateModule
  ]
})
export class SharedModule { }
