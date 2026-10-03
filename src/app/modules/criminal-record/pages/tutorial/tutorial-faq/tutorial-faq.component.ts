import { Component, OnInit } from '@angular/core';
import { TutorialStore } from '../../../stores/tutorial.store';

@Component({
  selector: 'app-tutorial-faq',
  templateUrl: './tutorial-faq.component.html',
  styleUrls: ['./tutorial-faq.component.scss']
})
export class TutorialFaqComponent implements OnInit {

  constructor(
    public store: TutorialStore,
  ) { }

  ngOnInit(): void {

  }

}
