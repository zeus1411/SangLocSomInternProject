import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormInstanceComponent } from './form-instance.component';

describe('FormInstanceComponent', () => {
  let component: FormInstanceComponent;
  let fixture: ComponentFixture<FormInstanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormInstanceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormInstanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
