import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenFileDocComponent } from './open-file-doc.component';

describe('OpenFileDocComponent', () => {
  let component: OpenFileDocComponent;
  let fixture: ComponentFixture<OpenFileDocComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OpenFileDocComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenFileDocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
