import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SvcSearchInputComponent } from './svc-search-input.component';

describe('SvcSearchInputComponent', () => {
  let component: SvcSearchInputComponent;
  let fixture: ComponentFixture<SvcSearchInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SvcSearchInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SvcSearchInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
