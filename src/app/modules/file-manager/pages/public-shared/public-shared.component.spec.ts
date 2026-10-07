import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicSharedComponent } from './public-shared.component';

describe('PublicSharedComponent', () => {
  let component: PublicSharedComponent;
  let fixture: ComponentFixture<PublicSharedComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PublicSharedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicSharedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
