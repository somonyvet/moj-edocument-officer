import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickAccessCommandbarComponent } from './quick-access-commandbar.component';

describe('QuickAccessCommandbarComponent', () => {
  let component: QuickAccessCommandbarComponent;
  let fixture: ComponentFixture<QuickAccessCommandbarComponent>;

  beforeEach(waitForAsync(() => {
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
