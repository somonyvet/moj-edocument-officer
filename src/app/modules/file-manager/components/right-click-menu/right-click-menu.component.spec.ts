import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { RightClickMenuComponent } from './right-click-menu.component';

describe('RightClickMenuComponent', () => {
  let component: RightClickMenuComponent;
  let fixture: ComponentFixture<RightClickMenuComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RightClickMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RightClickMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
