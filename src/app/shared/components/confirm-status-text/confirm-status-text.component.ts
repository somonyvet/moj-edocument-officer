import { Component, Input, OnInit } from '@angular/core';
import { AnimationOptions } from 'ngx-lottie';

@Component({
  selector: 'app-confirm-status-text',
  templateUrl: './confirm-status-text.component.html',
  styleUrls: ['./confirm-status-text.component.scss']
})
export class ConfirmStatusTextComponent implements OnInit {

  @Input() title;
  @Input() subTitle;
  @Input() label;

  lottie: AnimationOptions = {
    path: '../../../../assets/animate/45793-confirmed.json',
  };
  
  constructor(
  ) { }

  ngOnInit(): void {
    
  }

}
