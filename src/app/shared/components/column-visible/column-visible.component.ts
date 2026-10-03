import { FormControl } from '@angular/forms';
import { AuthStore } from '../../../stores/auth.store';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-column-visible',
  templateUrl: './column-visible.component.html',
  styleUrls: ['./column-visible.component.scss']
})
export class ColumnVisibleComponent implements OnInit {
  @Input() field:any;
  @Input() data:any;
  @Input() collection:any;

  columnInput=new FormControl();

  constructor(public auth:AuthStore ) { }

  ngOnInit() {}

  onVisible(event,list,item:any){
    event.stopPropagation();
  }

}
