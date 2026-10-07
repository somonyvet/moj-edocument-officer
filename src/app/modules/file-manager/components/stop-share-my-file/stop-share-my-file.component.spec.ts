import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { StopShareMyFileComponent } from './stop-share-my-file.component';

describe('StopShareMyFileComponent', () => {
  let component: StopShareMyFileComponent;
  let fixture: ComponentFixture<StopShareMyFileComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ StopShareMyFileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StopShareMyFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
