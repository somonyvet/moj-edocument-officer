import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VillageFormComponent } from './village-form.component';

describe('VillageFormComponent', () => {
  let component: VillageFormComponent;
  let fixture: ComponentFixture<VillageFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VillageFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VillageFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
