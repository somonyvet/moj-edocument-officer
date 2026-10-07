import { Component, Input, OnChanges, ChangeDetectionStrategy } from '@angular/core';
import { DECREE_STATUS_OBJ, PHOTO_LIB } from 'src/app/dummy/appinfo';
import { transformImageSameTokenNo } from 'src/app/shared/services/fireStorage.service';
import { ICriminalRecord } from 'src/app/interfaces/criminal.interface';

@Component({
    selector: 'app-decree-result-view',
    templateUrl: './decree-result-view.component.html',
    styleUrls: ['./decree-result-view.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DecreeResultViewComponent implements OnChanges {
  @Input() criminalRecord: ICriminalRecord;

  workplaceComments: any[] = [];

  ngOnChanges(): void {
    this.workplaceComments = this.mapWorkplaceComments();
  }

  get decreeResult(): string {
    return this.criminalRecord?.decree_result?.name || null;
  }

  get decreeStatus(): string {
    return this.criminalRecord?.decree_status?.name || null;
  }

  get isValidDecreeRecord(): boolean {
    return this.criminalRecord?.decree_status?.key === DECREE_STATUS_OBJ.valid_decree_record.key;
  }

  get decreeComment(): string {
    return this.criminalRecord?.comment_officer || null;
  }

  private mapWorkplaceComments(): any[] {
    const workplaces = this.criminalRecord?.workplaces;
    if (!workplaces?.length) return [];
    return [...workplaces]
      .filter((m: any) => !!m?.comment)
      .sort((a: any, b: any) => (b?.flowNo || 0) - (a?.flowNo || 0))
      .map((m: any) => ({
        ...m,
        approved_at: m?.approved_at?.toDate ? m.approved_at.toDate() : m?.approved_at,
        approved_by: m?.approved_by ? { ...m.approved_by, photoUrl: this.mapPhotoUrl(m?.approved_by?.photoUrl) } : null,
      }));
  }

  get decreeBy(): any {
    const decree_by = this.criminalRecord?.decree_by;
    if (!decree_by) return null;
    return { ...decree_by, photoUrl: this.mapPhotoUrl((decree_by as any)?.photoUrl) };
  }

  handleImgError(ev: any) {
    const source = ev?.srcElement || ev?.target;
    if (source) source.src = PHOTO_LIB.EMPTY_AVATAR;
  }

  private mapPhotoUrl(photoUrl: string): string {
    return photoUrl ? transformImageSameTokenNo(photoUrl, '400').uri : PHOTO_LIB.EMPTY_AVATAR;
  }

  get decreeAt(): any {
    const decree_at = this.criminalRecord?.decree_at;
    if (!decree_at) return null;
    return decree_at?.toDate ? decree_at.toDate() : decree_at;
  }
}
