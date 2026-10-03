import { Pipe, PipeTransform } from '@angular/core';
import { Directive, ElementRef } from '@angular/core';

@Pipe({
  name: 'prefixFocusAndSelect'
})
export class PrefixFocusAndSelectPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}


@Directive({
  selector: '[scroll-to-bottom]'
})
export class ScrollToBottomDirective {
  constructor(private _el: ElementRef) { }


  public scrollToBottom() {
    const el: HTMLDivElement = this._el.nativeElement;
    el.scrollTop = Math.max(0, el.scrollHeight - el.offsetHeight);
  }
}