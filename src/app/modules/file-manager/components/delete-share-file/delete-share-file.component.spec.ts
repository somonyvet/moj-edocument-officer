import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteShareFileComponent } from './delete-share-file.component';

describe('DeleteShareFileComponent', () => {
  let component: DeleteShareFileComponent;
  let fixture: ComponentFixture<DeleteShareFileComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DeleteShareFileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteShareFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
