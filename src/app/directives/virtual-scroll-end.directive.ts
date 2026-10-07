import { Directive, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Subscription } from 'rxjs';

export interface IPageInfo {
  endIndex: number;
}

/**
 * Replicates ngx-virtual-scroller's (vsEnd) output on a cdk-virtual-scroll-viewport,
 * so templates migrating off ngx-virtual-scroller don't need their (vsEnd) handlers changed.
 */
@Directive({
    selector: 'cdk-virtual-scroll-viewport[vsEnd]',
    standalone: false
})
export class CdkVirtualScrollEndDirective implements OnDestroy {
  @Output() vsEnd = new EventEmitter<IPageInfo>();
  private sub: Subscription;

  constructor(private viewport: CdkVirtualScrollViewport) {
    this.sub = this.viewport.renderedRangeStream.subscribe(range => {
      this.vsEnd.emit({ endIndex: range.end - 1 });
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}

/**
 * Replicates ngx-virtual-scroller's (vsEnd) output on a plain scrollable element
 * (used where virtualizing a native <table> isn't practical), so (vsEnd) handlers
 * written against ngx-virtual-scroller's IPageInfo shape keep working unchanged.
 */
@Directive({
    selector: '[appScrollEnd]',
    host: {
        '(scroll)': 'onScroll($event)',
    },
    standalone: false
})
export class ScrollEndDirective implements OnInit {
  @Input() appScrollEnd: any[] = [];
  @Output() vsEnd = new EventEmitter<IPageInfo>();

  private triggered = false;

  ngOnInit(): void {
    this.triggered = false;
  }

  onScroll(event: Event): void {
    const el = event.target as HTMLElement;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 48;
    if (nearBottom) {
      if (this.triggered) return;
      this.triggered = true;
      this.vsEnd.emit({ endIndex: (this.appScrollEnd?.length || 1) - 1 });
    } else {
      this.triggered = false;
    }
  }
}
