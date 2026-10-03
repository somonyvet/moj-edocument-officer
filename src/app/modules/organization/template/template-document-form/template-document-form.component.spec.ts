import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateDocumentFormComponent } from './template-document-form.component';

describe('TemplateDocumentFormComponent', () => {
  let component: TemplateDocumentFormComponent;
  let fixture: ComponentFixture<TemplateDocumentFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TemplateDocumentFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateDocumentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
