import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterListingComponent } from './filter-listing.component';

describe('FilterListingComponent', () => {
  let component: FilterListingComponent;
  let fixture: ComponentFixture<FilterListingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilterListingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
