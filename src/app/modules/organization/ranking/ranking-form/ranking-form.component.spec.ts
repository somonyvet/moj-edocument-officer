import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RankingFormComponent } from './ranking-form.component';

describe('RankingFormComponent', () => {
  let component: RankingFormComponent;
  let fixture: ComponentFixture<RankingFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RankingFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RankingFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
