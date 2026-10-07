import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-primary-button',
    templateUrl: './primary-button.component.html',
    styleUrls: ['./primary-button.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class PrimaryButtonComponent implements OnInit {
  @Input() class:any;
  @Input() css:any;
  @Input() process:boolean;
  @Input() disable:boolean = false;
  @Input() label:string;
  @Output() onPress=new EventEmitter();
  @Input() btnId:string;
  @Input() btnType:string;
  @Input() img:string;

  constructor() { }

  ngOnInit() {
  }

  _onPress(){
    this.onPress.emit();
  }
}
