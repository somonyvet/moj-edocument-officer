import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileNameDocComponent } from './file-name-doc.component';

describe('FileNameDocComponent', () => {
  let component: FileNameDocComponent;
  let fixture: ComponentFixture<FileNameDocComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FileNameDocComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileNameDocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
