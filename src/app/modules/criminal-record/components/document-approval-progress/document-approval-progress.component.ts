import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { orderBy } from 'src/app/shared/services/convert.service';
import { PHOTO_LIB, STATUS_OBJ } from 'src/app/dummy/appinfo';
import { transformImageSameTokenNo } from 'src/app/shared/services/fireStorage.service';
import { ICriminalRecord } from 'src/app/interfaces/criminal.interface';

export const APPROVAL_STEP_STATUS = {
  approved: 'approved',
  pending: 'pending',
  waiting: 'waiting',
};

@Component({
  selector: 'app-document-approval-progress',
  templateUrl: './document-approval-progress.component.html',
  styleUrls: ['./document-approval-progress.component.scss']
})
export class DocumentApprovalProgressComponent implements OnInit, OnChanges {
  @Input() criminalRecord: ICriminalRecord
  steps: any[] = [];
  isFullyApproved = false;
  APPROVED_STATUS = STATUS_OBJ.APPROVED;

  constructor() { }

  ngOnInit(): void {
    this.buildSteps();
  }

  ngOnChanges(): void {
    this.buildSteps();
  }

  buildSteps() {
    const record = this.criminalRecord;
    const workplaces = orderBy(record?.workplaces || [], 'flowNo');
    const approvedKeys = record?.approved_workplaceKeys || [];
    const requestKeys = record?.request_approval_workplace_keys || [];

    this.steps = workplaces.map((m: any) => {
      const departmentKey = m?.department?.key;
      const isApproved = !!m?.approved_at || approvedKeys.includes(departmentKey);
      const isPending = !isApproved && requestKeys.includes(departmentKey);
      return {
        ...m,
        departmentKey,
        departmentName: m?.department?.name || m?.department?.nameKh || null,
        approvedAt: this.toDate(m?.approved_at),
        approvedBy: m?.approved_by ? { ...m.approved_by, photoUrl: this.mapPhotoUrl(m?.approved_by?.photoUrl) } : null,
        status: isApproved
          ? APPROVAL_STEP_STATUS.approved
          : isPending ? APPROVAL_STEP_STATUS.pending : APPROVAL_STEP_STATUS.waiting,
      }
    })

    this.isFullyApproved = this.steps?.length > 0
      && this.steps.every((s: any) => s?.status === APPROVAL_STEP_STATUS.approved);
  }

  mapPhotoUrl(photoUrl: string): string {
    return photoUrl ? transformImageSameTokenNo(photoUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR;
  }

  handleImgError(ev: any) {
    const source = ev?.srcElement || ev?.target;
    if (source) source.src = PHOTO_LIB.EMPTY_AVATAR;
  }

  toDate(value: any) {
    if (!value) return null;
    if (typeof value?.toDate === 'function') return value.toDate();
    return new Date(value);
  }

}
