import { Component, Input, OnInit } from '@angular/core';
import { IManagementLevel } from 'src/app/interfaces/document/document.interface';
import { pushToObject } from '../../services/convert.service';
import { DatabaseService } from '../../services/database.service';

@Component({
  selector: 'app-top-management-position',
  templateUrl: './top-management-position.component.html',
  styleUrls: ['./top-management-position.component.scss']
})
export class TopManagementPositionComponent implements OnInit {
  @Input() docKey: string;

  item: IManagementLevel;
  constructor(private ds: DatabaseService) { }

  async ngOnInit(): Promise<void> {
    this.item = pushToObject(await this.ds.managementLevelFireRef().doc(this.docKey).get().toPromise())
  }

}
