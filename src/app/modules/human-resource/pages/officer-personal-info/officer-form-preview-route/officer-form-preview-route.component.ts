import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AnimationOptions } from 'ngx-lottie';
import { PrintService } from 'src/app/shared/services/print.service';
import { HrStore } from '../../../stores/hr.store';

@Component({
  selector: 'app-officer-form-preview-route',
  templateUrl: './officer-form-preview-route.component.html',
  styleUrls: ['./officer-form-preview-route.component.scss']
})
export class OfficerFormPreviewRouteComponent implements OnInit {

  lottie: AnimationOptions = {
    path: '../../../../../assets/animate/109279-checklist.json',
  };

  docKey:string = 'na';
  childrenRoute = 'certificate'
  backUrl:string=null;

  loading : boolean = false;

  constructor(
    private activateRoute : ActivatedRoute,
    private dialog:MatDialog,
    private ps: PrintService,
    public store: HrStore,
    private router:Router,
  ) { }

  ngOnInit(): void {
    this.backUrl=JSON.stringify(this.router.url)
    this.activateRoute.params.subscribe(params=>{
      // this.loading = true;
      const { docKey } = params;
      this.docKey = docKey;
      // this.store.fetchSelectedOfficer(this.docKey, doc=>{
      //   this.loading = false;
      // })
    })
  }

  print() {
    const str = '#print'
    this.ps.print(str, 'a4')
  }

}
