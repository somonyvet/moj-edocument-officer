import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-empty-data',
    templateUrl: './empty-data.component.html',
    styleUrls: ['./empty-data.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class EmptyDataComponent implements OnInit {
  @Input() buttonText: string;
  @Input() subtitle: string;
  @Input() name: string;
  @Output() onPress = new EventEmitter();
  @Input() imageUrl:any;

  constructor() { }

  ngOnInit() {
  }

  create() {
    this.onPress.emit();
  }

}
