import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AuthStore } from 'src/app/stores/auth.store';

@Component({
  selector: 'app-criminal-layout',
  templateUrl: './criminal-layout.component.html',
  styleUrls: ['./criminal-layout.component.scss']
})
export class CriminalLayoutComponent implements OnInit {

  constructor(public auth: AuthStore,
    public changeRef: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.auth.isCompany = true;
  }

  ngAfterViewChecked(): void { this.changeRef.detectChanges(); }


}
