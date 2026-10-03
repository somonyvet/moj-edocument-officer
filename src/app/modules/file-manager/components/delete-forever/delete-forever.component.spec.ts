import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteForeverComponent } from './delete-forever.component';

describe('DeleteForeverComponent', () => {
  let component: DeleteForeverComponent;
  let fixture: ComponentFixture<DeleteForeverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeleteForeverComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteForeverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
