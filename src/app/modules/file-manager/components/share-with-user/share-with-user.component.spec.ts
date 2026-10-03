import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareWithUserComponent } from './share-with-user.component';

describe('ShareWithUserComponent', () => {
  let component: ShareWithUserComponent;
  let fixture: ComponentFixture<ShareWithUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShareWithUserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareWithUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
