import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateRouteComponent } from './template-route.component';

describe('TemplateRouteComponent', () => {
  let component: TemplateRouteComponent;
  let fixture: ComponentFixture<TemplateRouteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TemplateRouteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
