import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddGroupUserAccountComponent } from './add-group-user-account.component';

describe('AddGroupUserAccountComponent', () => {
  let component: AddGroupUserAccountComponent;
  let fixture: ComponentFixture<AddGroupUserAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddGroupUserAccountComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddGroupUserAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
