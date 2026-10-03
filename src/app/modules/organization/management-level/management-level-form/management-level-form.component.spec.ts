import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagementLevelFormComponent } from './management-level-form.component';

describe('ManagementLevelFormComponent', () => {
  let component: ManagementLevelFormComponent;
  let fixture: ComponentFixture<ManagementLevelFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManagementLevelFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagementLevelFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
