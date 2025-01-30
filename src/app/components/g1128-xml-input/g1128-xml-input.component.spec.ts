import { ComponentFixture, TestBed } from '@angular/core/testing';

import { G1128XmlInputComponent } from './g1128-xml-input.component';

describe('G1128XmlInputComponent', () => {
  let component: G1128XmlInputComponent;
  let fixture: ComponentFixture<G1128XmlInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [G1128XmlInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(G1128XmlInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
