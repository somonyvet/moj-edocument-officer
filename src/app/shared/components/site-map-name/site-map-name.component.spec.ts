import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteMapNameComponent } from './site-map-name.component';

describe('SiteMapNameComponent', () => {
  let component: SiteMapNameComponent;
  let fixture: ComponentFixture<SiteMapNameComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SiteMapNameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SiteMapNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
