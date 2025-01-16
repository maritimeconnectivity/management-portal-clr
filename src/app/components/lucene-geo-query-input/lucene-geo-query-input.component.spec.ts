import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LuceneGeoQueryInputComponent } from './lucene-geo-query-input.component';

describe('LuceneGeoQueryInputComponent', () => {
  let component: LuceneGeoQueryInputComponent;
  let fixture: ComponentFixture<LuceneGeoQueryInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LuceneGeoQueryInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LuceneGeoQueryInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
