import {Component, Input} from '@angular/core';
import {NgForOf, NgIf} from "@angular/common";
import {ClrSpinnerModule} from "@clr/angular";

export interface LabelValueModel {
    label: string;
    value: string;
    isLink?: boolean;
    isEmail?: boolean;
}

@Component({
    selector: 'app-label-value-table',
    standalone: true,
    imports: [
        NgForOf,
        NgIf,
        ClrSpinnerModule
    ],
    templateUrl: './label-value-table.component.html',
    styleUrl: './label-value-table.component.css'
})
export class LabelValueTableComponent {
    @Input() labelValues?: LabelValueModel[];
    @Input() isLoading?: boolean;
    // public tablesClass: string;

}
