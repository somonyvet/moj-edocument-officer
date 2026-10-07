import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeoDataVillageComponent } from './geo-data-village.component';

describe('GeoDataVillageComponent', () => {
  let component: GeoDataVillageComponent;
  let fixture: ComponentFixture<GeoDataVillageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GeoDataVillageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeoDataVillageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
