import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemtypeOverviewComponent } from './itemtype-overview.component';

describe('ItemtypeOverviewComponent', () => {
  let component: ItemtypeOverviewComponent;
  let fixture: ComponentFixture<ItemtypeOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemtypeOverviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItemtypeOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
