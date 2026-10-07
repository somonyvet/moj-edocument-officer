import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileTypeDocComponent } from './file-type-doc.component';

describe('FileTypeDocComponent', () => {
  let component: FileTypeDocComponent;
  let fixture: ComponentFixture<FileTypeDocComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FileTypeDocComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileTypeDocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
