import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareMyFileComponent } from './share-my-file.component';

describe('ShareMyFileComponent', () => {
  let component: ShareMyFileComponent;
  let fixture: ComponentFixture<ShareMyFileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShareMyFileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareMyFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
