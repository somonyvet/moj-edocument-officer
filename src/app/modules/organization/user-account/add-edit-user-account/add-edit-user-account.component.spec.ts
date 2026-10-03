import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditUserAccountComponent } from './add-edit-user-account.component';

describe('AddEditUserAccountComponent', () => {
  let component: AddEditUserAccountComponent;
  let fixture: ComponentFixture<AddEditUserAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditUserAccountComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditUserAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
