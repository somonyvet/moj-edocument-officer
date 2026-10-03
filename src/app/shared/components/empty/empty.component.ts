import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-empty',
  templateUrl: './empty.component.html',
  styleUrls: ['./empty.component.scss']
})
export class EmptyComponent implements OnInit {

  @Input() buttonText: string;
  @Input() subtitle: string;
  @Input() name: string;
  @Input() img: string;
  @Input() className: string;

  @Output() onPress = new EventEmitter();

  public lottieConfig: Object;
  private anim: any;
  private animationSpeed: number = 1;
  constructor() {
    this.lottieConfig = {
      path: 'assets/animate/empty.json',
      renderer: 'canvas',
      autoplay: true,
      loop: true
    };
  }

  handleAnimation(anim: any) {
    this.anim = anim;
  }

  ngOnInit() {
  }

  create() {
    this.onPress.emit();
  }


}
