import { Component, OnInit, Input } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-company-field',
  templateUrl: './company-field.component.html',
  styleUrls: ['./company-field.component.scss']
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
