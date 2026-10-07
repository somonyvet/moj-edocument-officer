import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadTaskComponent } from './upload-task.component';

describe('UploadTaskComponent', () => {
  let component: UploadTaskComponent;
  let fixture: ComponentFixture<UploadTaskComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UploadTaskComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
