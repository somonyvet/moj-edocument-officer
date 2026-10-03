import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { IQuarter } from 'src/app/interfaces/document/document.interface';
import { toFlatten, toUniq } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { ProjectStore } from 'src/app/stores/project/project.store';

@Component({
  selector: 'app-project-activation-form',
  templateUrl: './project-activation-form.component.html',
  styleUrls: ['./project-activation-form.component.scss']
})
export class ProjectActivationFormComponent implements OnInit {
  form: FormGroup;
  title: string = ``;

  quaterItems: IQuarter[] = [];
  loading: boolean = true;
  constructor(public dialogRef: MatDialogRef<ProjectActivationFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    public store: ProjectStore,
    private auth: AuthStore,
    private router: Router,
    private snackBar: MatSnackBar,
  ) { }

  async ngOnInit(): Promise<void> {
    const { project } = this.data;
    this.title = `ដាក់ផែនការអនុម័តឲ្យលើផែនការជាត្រីមាស: ${project?.name}`;
    this.form = this.fb.group({
      quater: [null, [Validators.required]]
    })
    this.quaterItems = await this.store.fetchQuaters();
    const items = await this.store.fetchAnnualProjectQuarters(project?.key, null);
    const itemKeys = items?.map(m => m?.key);
    this.form.patchValue({
      quater: this.quaterItems?.filter(m => itemKeys?.includes(m?.key))
    })
    this.loading = false;
  }

  _onSave(f: any) {
    if (this.form.valid) {
      this.form.disable()
      const { quater } = f;
      const { project } = this.data;
      const { activities } = this.store;
      const workplaceKeys = toUniq(toFlatten(activities?.map(m => m?.departmentKeys)));
      this.auth.publicAnnualProject(project, quater, workplaceKeys).then(() => {
        this.snackBar.open(`ផែនការអនុម័តប្រចាំឆ្នាំត្រូវបានដាក់ឲ្យលើកផែនការត្រីមាស`, "ជោគជ័យ", { duration: 3000 });
        this.dialogRef.close('yes')
        this.router.navigate([`/planing/programs/${project?.key}/activities`])
      }).catch(error => {
        alert(error)
      }).finally(() => {
        this.form.enable()
      })
    }
  }


}
