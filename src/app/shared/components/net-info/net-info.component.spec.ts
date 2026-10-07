import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { NetInfoComponent } from './net-info.component';

describe('NetInfoComponent', () => {
  let component: NetInfoComponent;
  let fixture: ComponentFixture<NetInfoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NetInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NetInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
