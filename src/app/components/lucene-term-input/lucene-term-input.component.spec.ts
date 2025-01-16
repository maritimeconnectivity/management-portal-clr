import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LuceneTermInputComponent } from './lucene-term-input.component';

describe('LuceneTermInputComponent', () => {
  let component: LuceneTermInputComponent;
  let fixture: ComponentFixture<LuceneTermInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LuceneTermInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LuceneTermInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
