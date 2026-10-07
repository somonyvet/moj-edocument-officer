import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedWithOtherComponent } from './shared-with-other.component';

describe('SharedWithOtherComponent', () => {
  let component: SharedWithOtherComponent;
  let fixture: ComponentFixture<SharedWithOtherComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SharedWithOtherComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SharedWithOtherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
