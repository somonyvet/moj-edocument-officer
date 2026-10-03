import { Component, OnInit } from '@angular/core';
import { LIST_DOC_ARRAY } from 'src/app/dummy/status';
import { AuthStore } from 'src/app/stores/auth.store';

@Component({
  selector: 'app-document-listing-panel',
  templateUrl: './document-listing-panel.component.html',
  styleUrls: ['./document-listing-panel.component.scss']
})
export class DocumentListingPanelComponent implements OnInit {

  LIST_DOC_ARRAY = LIST_DOC_ARRAY
  constructor(
    public auth:AuthStore
  ) { }

  ngOnInit(): void {
  }

}
