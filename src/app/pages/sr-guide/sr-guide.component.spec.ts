import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SrGuideComponent } from './sr-guide.component';

describe('SrGuideComponent', () => {
  let component: SrGuideComponent;
  let fixture: ComponentFixture<SrGuideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SrGuideComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SrGuideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
