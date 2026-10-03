import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagementLevelComponent } from './management-level.component';

describe('ManagementLevelComponent', () => {
  let component: ManagementLevelComponent;
  let fixture: ComponentFixture<ManagementLevelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManagementLevelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagementLevelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
