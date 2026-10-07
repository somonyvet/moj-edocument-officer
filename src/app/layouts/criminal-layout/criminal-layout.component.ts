import { ChangeDetectorRef, Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AuthStore } from 'src/app/stores/auth.store';

@Component({
    selector: 'app-criminal-layout',
    templateUrl: './criminal-layout.component.html',
    styleUrls: ['./criminal-layout.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CriminalLayoutComponent implements OnInit {

  constructor(public auth: AuthStore,
    public changeRef: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.auth.isCompany = true;
  }

  ngAfterViewChecked(): void { this.changeRef.detectChanges(); }


}
