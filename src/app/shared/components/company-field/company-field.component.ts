import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
    selector: 'app-company-field',
    templateUrl: './company-field.component.html',
    styleUrls: ['./company-field.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CompanyFieldComponent implements OnInit {
  @Input() key;
  @Input() feild;
  data
  constructor(private afs: AngularFirestore) { }
  ngOnInit() {
    this.afs.collection('company').doc(this.key).valueChanges().subscribe(doc => {
      this.data = doc;
    })
  }

}
