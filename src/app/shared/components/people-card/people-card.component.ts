import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { PHOTO_LIB } from 'src/app/dummy/appinfo';
import { IOfficer } from 'src/app/interfaces/document/document.interface';
import { pushToObject } from '../../services/convert.service';
import { DatabaseService } from '../../services/database.service';

@Component({
    selector: 'app-people-card',
    templateUrl: './people-card.component.html',
    styleUrls: ['./people-card.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class PeopleCardComponent implements OnInit {
  @Input() officerKey: string;

  item: IOfficer = null;
  defaultImg = PHOTO_LIB.EMPTY;

  constructor(private ds: DatabaseService) { }

  async ngOnInit(): Promise<void> {
    if(this.officerKey){
      const doc = await this.ds.officerRef().doc(this.officerKey).get().toPromise();
      this.item = pushToObject(doc)
    }
  }

}
