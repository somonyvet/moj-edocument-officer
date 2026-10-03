import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentChartComponent } from './comment-chart.component';

describe('CommentChartComponent', () => {
  let component: CommentChartComponent;
  let fixture: ComponentFixture<CommentChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommentChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
