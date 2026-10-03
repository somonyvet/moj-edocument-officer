import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DistrictFormComponent } from './district-form.component';

describe('DistrictFormComponent', () => {
  let component: DistrictFormComponent;
  let fixture: ComponentFixture<DistrictFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DistrictFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DistrictFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
