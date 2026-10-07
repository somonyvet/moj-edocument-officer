import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { LineLoadingComponent } from './line-loading.component';

describe('LineLoadingComponent', () => {
  let component: LineLoadingComponent;
  let fixture: ComponentFixture<LineLoadingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LineLoadingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LineLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
