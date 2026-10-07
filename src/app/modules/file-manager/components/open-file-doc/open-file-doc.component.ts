import { Component, OnInit, Inject, ViewChild, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-open-file-doc',
    templateUrl: './open-file-doc.component.html',
    styleUrls: ['./open-file-doc.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class OpenFileDocComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<OpenFileDocComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, ) { }

  ngOnInit() {

  }

}
