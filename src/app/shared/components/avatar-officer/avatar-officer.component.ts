import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PHOTO_LIB } from 'src/app/dummy/appinfo';
import { IOfficer } from 'src/app/interfaces/document/document.interface';
import { pushToObject } from '../../services/convert.service';
import { DatabaseService } from '../../services/database.service';
import { transformImageSameTokenNo } from '../../services/fireStorage.service';

@Component({
  selector: 'app-avatar-officer',
  templateUrl: './avatar-officer.component.html',
  styleUrls: ['./avatar-officer.component.scss']
})
export class AvatarOfficerComponent implements OnInit {
  @Input() officerKey: string;
  @Input() ownerProfile: any;
  @Output() onRemove = new EventEmitter();
  @Output() onEdit = new EventEmitter();

  @Input() checkIcon: boolean;
  @Input() description: string;
  @Input() isOwner: boolean;

  @Input() removeStyle: boolean;
  @Input() imgCss: any;
  @Input() borderColor: string;

  @Input() workplace: any;

  item: IOfficer = null;
  defaultImg = PHOTO_LIB.EMPTY;
  loading: boolean = true;

  constructor(private ds: DatabaseService) { }

  async ngOnInit(): Promise<void> {
    if (this.ownerProfile) {
      this.item = { ...this.ownerProfile, photoUrl: this.ownerProfile?.file?.downloadUrl ? transformImageSameTokenNo(this.ownerProfile?.file?.downloadUrl, '200').uri : PHOTO_LIB.EMPTY_AVATAR };
      this.loading = false;
      return;
    }
    if (this.officerKey) {
      const doc = await this.ds.officerRef().doc(this.officerKey).get().toPromise();
      const officer: any = pushToObject(doc);
      this.item = officer ? { ...officer, photoUrl: officer?.file?.downloadUrl ? transformImageSameTokenNo(officer?.file?.downloadUrl, '200').uri : PHOTO_LIB.EMPTY_AVATAR, displayName: `${officer?.last_name} ${officer?.first_name}` } : null;
      // if (this.workplace) {
      //   const findInWorkplace = officer?.officeKeys.find(m => m === this.workplace?.key);
      //   this.item = findInWorkplace ? officer : null;
      // } else {
      // }
    }
    this.loading = false;
  }

  _onRemove() {
    if (this.isOwner) return;
    this.onRemove.emit(this.item)
  }

  _onEdit() {
    // if (this.isOwner) return;
    this.onEdit.emit(this.item)
  }


  handleImgError(ev: any) {
    let source = ev.srcElement;
    source.src = PHOTO_LIB.EMPTY_AVATAR;
  }

}
