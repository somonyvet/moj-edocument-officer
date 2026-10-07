import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { pushToObject } from 'src/app/shared/services/convert.service';
import { DataService } from 'src/app/shared/services/data.service';

@Component({
    selector: 'app-site-map-name',
    templateUrl: './site-map-name.component.html',
    styleUrls: ['./site-map-name.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class SiteMapNameComponent implements OnInit {
  @Input() fileKey: any;

  item: any;
  constructor(private ds: DataService) { }

  async ngOnInit() {
    if (this.fileKey) {
      const doc = await this.ds.folderRef().doc(this.fileKey).get().toPromise();
      this.item = pushToObject(doc);
    }
  }

}
