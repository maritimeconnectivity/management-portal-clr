import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IrGuideComponent } from './ir-guide.component';

describe('IrGuideComponent', () => {
  let component: IrGuideComponent;
  let fixture: ComponentFixture<IrGuideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IrGuideComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IrGuideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
