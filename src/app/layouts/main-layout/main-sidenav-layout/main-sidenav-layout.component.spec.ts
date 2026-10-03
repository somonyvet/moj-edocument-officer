import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainSidenavLayoutComponent } from './main-sidenav-layout.component';

describe('MainSidenavLayoutComponent', () => {
  let component: MainSidenavLayoutComponent;
  let fixture: ComponentFixture<MainSidenavLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MainSidenavLayoutComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MainSidenavLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
