import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmSuccessComponent } from './confirm-success.component';

describe('ConfirmSuccessComponent', () => {
  let component: ConfirmSuccessComponent;
  let fixture: ComponentFixture<ConfirmSuccessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmSuccessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
