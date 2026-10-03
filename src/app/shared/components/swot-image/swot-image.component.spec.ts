import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SwotImageComponent } from './swot-image.component';

describe('SwotImageComponent', () => {
  let component: SwotImageComponent;
  let fixture: ComponentFixture<SwotImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SwotImageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SwotImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
