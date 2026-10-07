import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeoDataDistrictComponent } from './geo-data-district.component';

describe('GeoDataDistrictComponent', () => {
  let component: GeoDataDistrictComponent;
  let fixture: ComponentFixture<GeoDataDistrictComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GeoDataDistrictComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeoDataDistrictComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
