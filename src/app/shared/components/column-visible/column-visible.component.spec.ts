import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ColumnVisibleComponent } from './column-visible.component';

describe('ColumnVisibleComponent', () => {
  let component: ColumnVisibleComponent;
  let fixture: ComponentFixture<ColumnVisibleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ColumnVisibleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColumnVisibleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
