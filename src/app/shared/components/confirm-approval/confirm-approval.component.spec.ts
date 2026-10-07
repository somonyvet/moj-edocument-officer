import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmApprovalComponent } from './confirm-approval.component';

describe('ConfirmApprovalComponent', () => {
  let component: ConfirmApprovalComponent;
  let fixture: ComponentFixture<ConfirmApprovalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmApprovalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
