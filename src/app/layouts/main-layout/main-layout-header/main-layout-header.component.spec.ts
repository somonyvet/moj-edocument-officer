import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainLayoutHeaderComponent } from './main-layout-header.component';

describe('MainLayoutHeaderComponent', () => {
  let component: MainLayoutHeaderComponent;
  let fixture: ComponentFixture<MainLayoutHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MainLayoutHeaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MainLayoutHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
