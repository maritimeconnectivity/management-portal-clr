import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemtypeChartComponent } from './itemtype-chart.component';

describe('ItemtypeChartComponent', () => {
  let component: ItemtypeChartComponent;
  let fixture: ComponentFixture<ItemtypeChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemtypeChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItemtypeChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
