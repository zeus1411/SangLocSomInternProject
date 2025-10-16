import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RenderValueComponent } from './render-value.component';

describe('RenderValueComponent', () => {
  let component: RenderValueComponent;
  let fixture: ComponentFixture<RenderValueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RenderValueComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RenderValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
