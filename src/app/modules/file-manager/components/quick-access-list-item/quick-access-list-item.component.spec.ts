import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickAccessListItemComponent } from './quick-access-list-item.component';

describe('QuickAccessListItemComponent', () => {
  let component: QuickAccessListItemComponent;
  let fixture: ComponentFixture<QuickAccessListItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuickAccessListItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuickAccessListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
