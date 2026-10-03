import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileTagComponent } from './file-tag.component';

describe('FileTagComponent', () => {
  let component: FileTagComponent;
  let fixture: ComponentFixture<FileTagComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FileTagComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
