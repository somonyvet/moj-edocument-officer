import { UntypedFormControl } from '@angular/forms';
import { AuthStore } from '../../../stores/auth.store';
import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-column-visible',
    templateUrl: './column-visible.component.html',
    styleUrls: ['./column-visible.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ColumnVisibleComponent implements OnInit {
  @Input() field:any;
  @Input() data:any;
  @Input() collection:any;

  columnInput=new UntypedFormControl();

  constructor(public auth:AuthStore ) { }

  ngOnInit() {}

  onVisible(event,list,item:any){
    event.stopPropagation();
  }

}
