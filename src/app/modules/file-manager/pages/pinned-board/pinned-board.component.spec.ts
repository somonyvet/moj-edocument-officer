import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PinnedBoardComponent } from './pinned-board.component';

describe('PinnedBoardComponent', () => {
  let component: PinnedBoardComponent;
  let fixture: ComponentFixture<PinnedBoardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PinnedBoardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PinnedBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
