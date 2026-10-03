import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverviewLayoutComponent } from './overview-layout.component';

describe('OverviewLayoutComponent', () => {
  let component: OverviewLayoutComponent;
  let fixture: ComponentFixture<OverviewLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OverviewLayoutComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OverviewLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
