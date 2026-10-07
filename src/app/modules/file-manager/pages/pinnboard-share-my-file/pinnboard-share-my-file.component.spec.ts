import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { PinnboardShareMyFileComponent } from './pinnboard-share-my-file.component';

describe('PinnboardShareMyFileComponent', () => {
  let component: PinnboardShareMyFileComponent;
  let fixture: ComponentFixture<PinnboardShareMyFileComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PinnboardShareMyFileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PinnboardShareMyFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
