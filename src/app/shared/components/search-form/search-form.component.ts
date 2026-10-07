import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { fileTypes, fileOwner, dateModified } from 'src/app/dummy/status';

interface Food {
  value: string;
  viewValue: string;
}

@Component({
    selector: 'app-search-form',
    templateUrl: './search-form.component.html',
    styleUrls: ['./search-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class SearchFormComponent implements OnInit {
  fileType_list = fileTypes;
  fileOwner_list= fileOwner;
  dateModified_list = dateModified;
  // foods: Food[] = [
  //   {value: 'steak-0', viewValue: 'Steak'},
  //   {value: 'pizza-1', viewValue: 'Pizza'},
  //   {value: 'tacos-2', viewValue: 'Tacos'}
  // ];
  
  constructor(
    public dialogRef: MatDialogRef<SearchFormComponent>,
  ) { }

  ngOnInit() {
  }
  onSave(){
    
  }

  onClose() {
    this.dialogRef.close('no')
  }
}
