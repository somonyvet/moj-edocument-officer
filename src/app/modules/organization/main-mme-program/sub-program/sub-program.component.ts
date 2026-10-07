import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-sub-program',
    templateUrl: './sub-program.component.html',
    styleUrls: ['./sub-program.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class SubProgramComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
