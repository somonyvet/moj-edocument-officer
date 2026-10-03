import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommuneFormComponent } from './commune-form.component';

describe('CommuneFormComponent', () => {
  let component: CommuneFormComponent;
  let fixture: ComponentFixture<CommuneFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommuneFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommuneFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
