import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeoDataComponent } from './geo-data.component';

describe('GeoDataComponent', () => {
  let component: GeoDataComponent;
  let fixture: ComponentFixture<GeoDataComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GeoDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeoDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
