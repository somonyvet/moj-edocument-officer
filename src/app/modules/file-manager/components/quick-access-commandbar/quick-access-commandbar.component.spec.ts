import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickAccessCommandbarComponent } from './quick-access-commandbar.component';

describe('QuickAccessCommandbarComponent', () => {
  let component: QuickAccessCommandbarComponent;
  let fixture: ComponentFixture<QuickAccessCommandbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuickAccessCommandbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuickAccessCommandbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
