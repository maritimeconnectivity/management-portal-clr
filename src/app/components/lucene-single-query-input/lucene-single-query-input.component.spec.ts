import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LuceneSingleQueryInputComponent } from './lucene-single-query-input.component';

describe('LuceneSingleQueryInputComponent', () => {
  let component: LuceneSingleQueryInputComponent;
  let fixture: ComponentFixture<LuceneSingleQueryInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LuceneSingleQueryInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LuceneSingleQueryInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
