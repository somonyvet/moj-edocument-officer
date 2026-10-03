import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentApplicationFormComponent } from './document-application-form.component';

describe('DocumentApplicationFormComponent', () => {
  let component: DocumentApplicationFormComponent;
  let fixture: ComponentFixture<DocumentApplicationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DocumentApplicationFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentApplicationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
