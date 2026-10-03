import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUserShareComponent } from './add-user-share.component';

describe('AddUserShareComponent', () => {
  let component: AddUserShareComponent;
  let fixture: ComponentFixture<AddUserShareComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddUserShareComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddUserShareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
