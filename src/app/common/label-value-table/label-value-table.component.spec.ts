import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabelValueTableComponent } from './label-value-table.component';

describe('LabelValueTableComponent', () => {
  let component: LabelValueTableComponent;
  let fixture: ComponentFixture<LabelValueTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LabelValueTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabelValueTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
