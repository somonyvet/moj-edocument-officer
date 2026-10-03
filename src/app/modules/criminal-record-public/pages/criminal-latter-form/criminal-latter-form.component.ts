import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { APPLICATION_TYPE_OBJ } from 'src/app/dummy/status';
import { CriminalStore } from 'src/app/modules/criminal-record/stores/criminal.store';
import { CriminalApplicationStore } from 'src/app/modules/criminal-record/stores/criminalApplication.store';
import { AuthStore } from 'src/app/stores/auth.store';

@Component({
  selector: 'app-criminal-latter-form',
  templateUrl: './criminal-latter-form.component.html',
  styleUrls: ['./criminal-latter-form.component.scss']
})
export class CriminalLatterFormComponent implements OnInit {
  loading: boolean = true;

  constructor(private route: ActivatedRoute,
    private criminal: CriminalStore,
    private router: Router,
    private auth: AuthStore,
    public store: CriminalApplicationStore) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.criminal.params = params;
      this.store.selectedApplicationType = APPLICATION_TYPE_OBJ[params?.pageKey];
      const { publicApplication, config } = this.auth;
      if (!this.store.selectedApplicationType || (publicApplication && this.store.selectedApplicationType?.key !== config?.criminal_application_type?.key)) {
        this.router.navigate([`/page-not-found`])
        return;
      }
    })
  }

}
