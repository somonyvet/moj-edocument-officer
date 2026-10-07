import { ChangeDetectorRef, Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AuthStore } from 'src/app/stores/auth.store';

@Component({
    selector: 'app-overview-layout',
    templateUrl: './overview-layout.component.html',
    styleUrls: ['./overview-layout.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class OverviewLayoutComponent implements OnInit {
  isReport: boolean = true;

  constructor(
    public auth: AuthStore,
    public changeRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.auth.isCompany = true;
  }

  ngAfterViewChecked(): void { this.changeRef.detectChanges(); }

}
