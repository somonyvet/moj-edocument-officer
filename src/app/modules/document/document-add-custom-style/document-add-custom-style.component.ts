import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, ElementRef, Inject, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, AbstractControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DOC_CUSTOM_STYLE_OBJ, DOC_POSITION_ARRAY, DOC_SPACING_ARRAY } from 'src/app/dummy/status';
import { DatabaseService } from 'src/app/shared/services/database.service';
import { FireStorageService } from 'src/app/shared/services/fireStorage.service';
import { toNumber } from 'src/app/shared/services/mapping.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { DocumentStore } from 'src/app/stores/document/document.store';

@Component({
    selector: 'app-document-add-custom-style',
    templateUrl: './document-add-custom-style.component.html',
    styleUrls: ['./document-add-custom-style.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DocumentAddCustomStyleComponent implements OnInit {

  @ViewChild('inputRef') inputRef: ElementRef;
  title: any = "សម្រួលគម្លាតអក្សរ";

  form: UntypedFormGroup;
  spacing: AbstractControl;
  spacing_value: AbstractControl;
  position: AbstractControl;
  position_value: AbstractControl;

  docSpacingArray = DOC_SPACING_ARRAY
  docPositionArray = DOC_POSITION_ARRAY

  constructor(
    public dialogRef: MatDialogRef<DocumentAddCustomStyleComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    public store: DocumentStore,
    public auth: AuthStore,
    public ds: DatabaseService,
    public storage: FireStorageService,
  ) { }

  ngOnInit(): void {
    const items = this.data.item;

    this.form = this.fb.group({
      spacing: [DOC_SPACING_ARRAY[0], [Validators.required],],
      spacing_value: [0, [Validators.compose([Validators.required, this.validCashIn.bind(this)])]],
      position: [DOC_POSITION_ARRAY[0], [Validators.required],],
      position_value: [0, [Validators.compose([Validators.required, this.validCashIn.bind(this)])]],
    })
    this.spacing = this.form.controls["spacing"];
    this.spacing_value = this.form.controls["spacing_value"];
    this.position = this.form.controls["position"];
    this.position_value = this.form.controls["position_value"];

    if (items && items.length > 0) {
      const spacingDoc = items.find(m => m?.spacing?.ref === DOC_CUSTOM_STYLE_OBJ.spacing.key)
      const positionDoc = items.find(m => m?.position?.ref === DOC_CUSTOM_STYLE_OBJ.position.key)

      this.form.patchValue({
        spacing: spacingDoc?.spacing || DOC_SPACING_ARRAY[0],
        spacing_value: spacingDoc.spacing_value || 0,

        position: positionDoc?.position || DOC_POSITION_ARRAY[0],
        position_value: positionDoc?.position_value || 0,
      })
    }
  }

  public validCashIn(control: AbstractControl): { [s: string]: boolean } {
    const value = control.value;
    if (value !== undefined && value !== null && value !== "") {
      if (value < 0) {
        return { validAmount: true }
      }
    }
  }

  compareWith(o1: any, o2: any): boolean {
    if (o2) return o1?.key === o2?.key;
  }

  _selectionChangeSpacing(event) {
    const { value } = event
    if (value && value.key === 1) {
      this.spacing_value.patchValue(0)
    }
  }

  _selectionChangePosition(event) {
    const { value } = event
    if (value && value.key === 1) {
      this.position_value.patchValue(0)
    }
  }

  async _onSave(f: any) {
    if (this.form.valid) {
      const { spacing, spacing_value, position, position_value } = f

      let customStyleArray = []
      const spacingItem = {
        ...DOC_CUSTOM_STYLE_OBJ.spacing,
        spacing,
        spacing_value,
        isNormal: spacing.key === 1 ? true : false,
        value: `${toNumber(spacing_value) * spacing.factor}px`
      }
      customStyleArray.push(spacingItem)

      const positionItem = {
        ...DOC_CUSTOM_STYLE_OBJ.position,
        position,
        position_value,
        isNormal: position.key === 1 ? true : false,
        value: `${toNumber(position_value) * position.factor}px`
      }
      customStyleArray.push(positionItem)

      this.dialogRef.close(customStyleArray);
    }
  }
}
