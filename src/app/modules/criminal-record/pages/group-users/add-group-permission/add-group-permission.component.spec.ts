import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddGroupPermissionComponent } from './add-group-permission.component';

describe('AddGroupPermissionComponent', () => {
  let component: AddGroupPermissionComponent;
  let fixture: ComponentFixture<AddGroupPermissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddGroupPermissionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddGroupPermissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
