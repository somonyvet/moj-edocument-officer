import { Component, OnInit } from '@angular/core';
import { TutorialStore } from '../../../stores/tutorial.store';

@Component({
  selector: 'app-tutorial-document',
  templateUrl: './tutorial-document.component.html',
  styleUrls: ['./tutorial-document.component.scss']
})
export class TutorialDocumentComponent implements OnInit {

  constructor(
    public store: TutorialStore,
  ) { }

  ngOnInit(): void {
  }

}
