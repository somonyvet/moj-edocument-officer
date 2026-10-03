import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { DataService } from 'src/app/shared/services/data.service';
import { MappingService } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { ProjectStore } from 'src/app/stores/project/project.store';

@Component({
  selector: 'app-project-activation',
  templateUrl: './project-activation.component.html',
  styleUrls: ['./project-activation.component.scss']
})
export class ProjectActivationComponent implements OnInit {
  form: FormGroup;
  annualProject: AbstractControl;
  fillterAnnualProjects: Observable<any[]>;
  title = `ចាប់ផ្ដើមដាក់បញ្ចូលកម្មវិធីក្នុងផែនការអនុម័តប្រចាំឆ្នាំ`;
  process: boolean = false;

  constructor(public store: ProjectStore,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    public ds: DataService,
    private auth: AuthStore,
    private snackBar: MatSnackBar,
    private router: Router) { }

  async ngOnInit(): Promise<void> {
    this.store.permissionAccessAnnualProject();
    this.form = this.fb.group({
      annualProject: [null, [Validators.required, MappingService.validSelected.bind(this)]]
    })
    this.annualProject = this.form.controls['annualProject'];
    const items = await this.store.fetchAnnualProjectListing();
    this.fillterAnnualProjects = MappingService.autoComplete(this.annualProject, items, "name");
    this.route.params.subscribe(params => {
      const { id } = params;
      this.form.patchValue({
        annualProject: items?.find(m => m?.key === id),
      })
    })
  }

  _onSave(f: any) {
    this.process = true;
    const { annualProject } = f;
    // this.auth.setActivePlaning(annualProject).then(() => {
    //   this.snackBar.open(`ផែនការអនុម័តប្រចាំឆ្នាំត្រូវបានដាក់ឲ្យចាប់ផ្ដើមដាក់បញ្ចូលកម្មវិធី`, "ជោគជ័យ", { duration: 3000 });
    //   this.router.navigate([`/planing/programs`], { queryParams: { annualProject: annualProject?.key } });
    // }).catch(error => {
    //   alert(error)
    // }).finally(() => {
    //   this.process = false;
    // })
  }

}
