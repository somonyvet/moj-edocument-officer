import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralDepartmentComponent } from './general-department.component';

describe('GeneralDepartmentComponent', () => {
  let component: GeneralDepartmentComponent;
  let fixture: ComponentFixture<GeneralDepartmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeneralDepartmentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralDepartmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
