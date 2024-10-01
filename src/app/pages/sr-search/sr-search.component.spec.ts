import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SrSearchComponent } from './sr-search.component';

describe('SrSearchComponent', () => {
  let component: SrSearchComponent;
  let fixture: ComponentFixture<SrSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SrSearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SrSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
