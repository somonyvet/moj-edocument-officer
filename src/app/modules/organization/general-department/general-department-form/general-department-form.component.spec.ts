import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralDepartmentFormComponent } from './general-department-form.component';

describe('GeneralDepartmentFormComponent', () => {
  let component: GeneralDepartmentFormComponent;
  let fixture: ComponentFixture<GeneralDepartmentFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeneralDepartmentFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralDepartmentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
