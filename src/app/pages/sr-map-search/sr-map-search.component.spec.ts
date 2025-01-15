import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SrMapSearchComponent } from './sr-map-search.component';

describe('SrMapSearchComponent', () => {
  let component: SrMapSearchComponent;
  let fixture: ComponentFixture<SrMapSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SrMapSearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SrMapSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
