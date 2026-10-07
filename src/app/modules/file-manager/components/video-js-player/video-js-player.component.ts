import { Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import videojs from 'video.js';

@Component({
    selector: 'app-video-js-player',
    templateUrl: './video-js-player.component.html',
    styleUrls: ['./video-js-player.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class VideoJsPlayerComponent implements OnInit {

  @ViewChild('target', {static: true}) target: ElementRef;

  @Input() options: {
    fluid: boolean,
    aspectRatio: string,
    autoplay: boolean,
    responsive: boolean,
    height: number,
    sources: {
      src: string,
      type: string,
    }[],
  };

  player: videojs.Player;

  constructor(
    private elementRef: ElementRef,
    private router: Router
  ) { }

  ngOnInit() {
    this.player = videojs(this.target.nativeElement, this.options, function onPlayerReady() {});
  }

  ngOnChanges(changes: SimpleChanges) {
    if(this.player) this.player.src(changes.options.currentValue?.sources);
  }

  ngOnDestroy() {
    if (this.player) {
      this.player.dispose();
    }
  }

}
