import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { CCY, INDUSTRY_OBJ, LANGUAGE, ROLEOFBUSS_OBJ, TYPEOFBUSS_OBJ, YEAROFBUSS_OBJ } from 'src/app/dummy/status';
import { AuthStore } from 'src/app/stores/auth.store';
import { CompanyStore } from 'src/app/stores/company.store';

@Component({
    selector: 'app-company-form',
    templateUrl: './company-form.component.html',
    styleUrls: ['./company-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CompanyFormComponent implements OnInit {

  page_nme: string = "Page Name"
  name: string = "User Name";
  valueProgress: number = 1;
  checkBack: boolean = false;
  titleHeader: string = "Let’s get started. Which of these best describes you?"
  titleHeaderSub: string = "We’ll help you get set up based on your business needs."

  vaformCHkFirst: any;

  isLinear = false;
  form: UntypedFormGroup;

  TYPEOFBUSS_OBJ = TYPEOFBUSS_OBJ;
  YEAROFBUSS_OBJ = YEAROFBUSS_OBJ;
  INDUSTRY_OBJ = INDUSTRY_OBJ;
  ROLEOFBUSS_OBJ = ROLEOFBUSS_OBJ;
  LANGUAGE = LANGUAGE;
  CURRENCY_LIST = CCY;
  
  constructor(
    private _formBuilder: UntypedFormBuilder,
    private fb: UntypedFormBuilder,
    public store: CompanyStore,
    public auth: AuthStore,
    private router: Router
  ) { }

  ngOnInit() {

    this.auth.isCompany = false;

    this.form = this.fb.group({
      lagalBussName: [null],
      typeBuss: [null],
      yearBuss: [null],
      industryBuss: [null],
      roleBuss: [null,],
    })
  }

  compareWith(o1: any, o2: any): boolean {
    if (o2) return o1?.key === o2?.key;
  }

  onClickNext() {

    if (this.valueProgress < 100) {
      this.valueProgress += 45;
    }
    if (this.valueProgress == 46) {
      this.titleHeader = "About Your Store";//Where would you like to sell?
      this.titleHeaderSub = "Pick as many as you like – you can always change these later. We'll make sure you're set up to sell in these places.";//Pick as many as you like – you can always change these later. We'll make sure you're set up to sell in these places.
    } else if (this.valueProgress == 91) {
      this.titleHeader = "Where will your business be located?";
      this.titleHeaderSub = "We’ll use your location to set up your default shipping rates, recommended apps, and more.";

    } else if (this.valueProgress == 136) {
      this.router.navigate([``])
    }

  }

  radioChange(event) {
    this.vaformCHkFirst = event?.value;
  }

  onClickBack() {
    this.valueProgress -= 45;

    if (this.valueProgress == 46) {
      this.titleHeader = "About Your Store";//Where would you like to sell?
      this.titleHeaderSub = "Pick as many as you like – you can always change these later. We'll make sure you're set up to sell in these places.";//Pick as many as you like – you can always change these later. We'll make sure you're set up to sell in these places.
    } else if (this.valueProgress == 91) {
      this.titleHeader = "Where will your business be located?";
      this.titleHeaderSub = "We’ll use your location to set up your default shipping rates, recommended apps, and more.";

    } else {
      this.titleHeader = "Let’s get started. Which of these best describes you?"
      this.titleHeaderSub = "We’ll help you get set up based on your business needs."
    }
  }

}
