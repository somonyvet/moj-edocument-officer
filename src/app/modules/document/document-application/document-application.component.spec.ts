import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentApplicationComponent } from './document-application.component';

describe('DocumentApplicationComponent', () => {
  let component: DocumentApplicationComponent;
  let fixture: ComponentFixture<DocumentApplicationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DocumentApplicationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentApplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
