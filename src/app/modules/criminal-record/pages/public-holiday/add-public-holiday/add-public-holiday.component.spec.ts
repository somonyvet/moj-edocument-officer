import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPublicHolidayComponent } from './add-public-holiday.component';

describe('AddPublicHolidayComponent', () => {
  let component: AddPublicHolidayComponent;
  let fixture: ComponentFixture<AddPublicHolidayComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddPublicHolidayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddPublicHolidayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
