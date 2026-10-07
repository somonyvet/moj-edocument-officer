import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { TutorialStore } from '../../../stores/tutorial.store';

@Component({
    selector: 'app-tutorial-faq',
    templateUrl: './tutorial-faq.component.html',
    styleUrls: ['./tutorial-faq.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class TutorialFaqComponent implements OnInit {

  constructor(
    public store: TutorialStore,
  ) { }

  ngOnInit(): void {

  }

}
