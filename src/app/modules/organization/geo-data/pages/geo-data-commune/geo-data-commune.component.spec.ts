import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeoDataCommuneComponent } from './geo-data-commune.component';

describe('GeoDataCommuneComponent', () => {
  let component: GeoDataCommuneComponent;
  let fixture: ComponentFixture<GeoDataCommuneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GeoDataCommuneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeoDataCommuneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
