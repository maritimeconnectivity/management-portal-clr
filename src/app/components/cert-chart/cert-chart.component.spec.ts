import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertChartComponent } from './cert-chart.component';

describe('CertChartComponent', () => {
  let component: CertChartComponent;
  let fixture: ComponentFixture<CertChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CertChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CertChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
