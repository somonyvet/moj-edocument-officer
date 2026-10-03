import { Directive, ElementRef } from '@angular/core';
import * as Stickyfill from 'stickyfilljs';


@Directive({
  selector: '[StickyPolyFill]'
})
export class StickyPolyFillDirective {

  constructor(private elementRef: ElementRef) { }

  ngAfterViewInit() {
    Stickyfill.addOne(this.elementRef.nativeElement);
  }
}