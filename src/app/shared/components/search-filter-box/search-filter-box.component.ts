import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-search-filter-box',
  templateUrl: './search-filter-box.component.html',
  styleUrls: ['./search-filter-box.component.scss']
})
export class SearchFilterBoxComponent implements OnInit ,  OnChanges  {
  @ViewChild('searchFilter') searchFilter: ElementRef;
  @Input() placeholder : string;
  @Input() clearInput : string;
  @Input() customClass : string;
  @Output() searchValue = new EventEmitter();
  @Output() focusOut = new EventEmitter();
  @Output() focusIn = new EventEmitter();
  @Output() closeSearch = new EventEmitter();
  @Output() scanQrCode = new EventEmitter();

  form : FormGroup;
  focusSearch: boolean = false;

  constructor(
    private f: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.form = this.f.group({
      searchFilter : null,
    })
    this.form.get('searchFilter').valueChanges
    .pipe(
      debounceTime(300),
    ).subscribe(res=>{
      this.searchValue.emit(res)
    });
  }

  onKeydownMain(event): void {
    if (event.keyCode === 13) {
      const value = this.form.get('searchFilter')?.value
      this.scanQrCode.emit(value)
      this.form.get('searchFilter').setValue(null)
  }
 }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes?.clearInput){
      this.form?.get('searchFilter')?.patchValue(null);
    }
  }

  onFocusSearch() {
    this.focusSearch = true;
    this.searchFilter?.nativeElement.focus()
    this.focusIn.emit();
  }
  onOutFocusSearch() {
    this.focusSearch = false;
    this.focusOut.emit();
  }

  onCloseSearch() {
    this.searchFilter = null
    this.form.get('searchFilter').patchValue(null);
    this.focusSearch = false;
    this.closeSearch.emit();
  }

  setStyleBtnCancel() {
    if (this.focusSearch || this.form.get('searchFilter').value) {
      return {
        transform: 'translateX(-27px)',
        opacity: 1,
      }
    } else {
      return {
        transform: 'translateX(0)',
        opacity: 0,
      }
    }
  }

}
