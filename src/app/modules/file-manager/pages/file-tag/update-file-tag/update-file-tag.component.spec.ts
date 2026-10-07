import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateFileTagComponent } from './update-file-tag.component';

describe('UpdateFileTagComponent', () => {
  let component: UpdateFileTagComponent;
  let fixture: ComponentFixture<UpdateFileTagComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdateFileTagComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateFileTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
