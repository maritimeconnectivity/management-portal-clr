import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmartExpandableTableComponent } from './smart-expandable-table.component';

describe('SmartExpandableTableComponent', () => {
  let component: SmartExpandableTableComponent;
  let fixture: ComponentFixture<SmartExpandableTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmartExpandableTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SmartExpandableTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
