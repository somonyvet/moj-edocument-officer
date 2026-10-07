import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileInfoNameDocComponent } from './file-info-name-doc.component';

describe('FileInfoNameDocComponent', () => {
  let component: FileInfoNameDocComponent;
  let fixture: ComponentFixture<FileInfoNameDocComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FileInfoNameDocComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileInfoNameDocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
