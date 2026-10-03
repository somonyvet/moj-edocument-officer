import { Component, OnInit, Input } from '@angular/core';
import { driveObj } from 'src/app/dummy/status';
import { DataService } from 'src/app/shared/services/data.service';

@Component({
  selector: 'app-file-type-doc',
  templateUrl: './file-type-doc.component.html',
  styleUrls: ['./file-type-doc.component.scss']
})
export class FileTypeDocComponent implements OnInit {

  @Input() item: any;

  type: any;
  name: any;
  fileType: any;
  DRIVE_OBJ = driveObj

  constructor(private ds: DataService) { }

  ngOnInit() {
    if (this.item) {
      const { type, fileKey } = this.item;

      if (type) this.type = type;
      else {
        this.ds.folderRef().doc(fileKey).valueChanges().subscribe((doc: any) => {
          this.type = doc && doc.type || null;

        })
      }
    }
  }

}
