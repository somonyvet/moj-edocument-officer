import { ChangeDetectorRef, Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AuthStore } from 'src/app/stores/auth.store';

@Component({
    selector: 'app-main-layout',
    templateUrl: './main-layout.component.html',
    styleUrls: ['./main-layout.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class MainLayoutComponent implements OnInit {
  isReport:boolean = true;

  constructor(
    public auth: AuthStore,
    public changeRef: ChangeDetectorRef
    ) { }

  ngOnInit(): void {
    this.auth.isCompany = true;
  }

  ngAfterViewChecked(): void { this.changeRef.detectChanges(); }


}
