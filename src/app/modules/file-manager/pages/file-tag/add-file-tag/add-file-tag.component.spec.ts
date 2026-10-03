import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFileTagComponent } from './add-file-tag.component';

describe('AddFileTagComponent', () => {
  let component: AddFileTagComponent;
  let fixture: ComponentFixture<AddFileTagComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddFileTagComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddFileTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
