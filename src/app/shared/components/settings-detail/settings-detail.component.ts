import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { SettingStore } from 'src/app/stores/settings/setting.store';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { PrintService } from 'src/app/shared/services/print.service';

@Component({
    selector: 'app-settings-detail',
    templateUrl: './settings-detail.component.html',
    styleUrls: ['./settings-detail.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class SettingsDetailComponent implements OnInit {
  @Input() title: string;
  @Input() data: any;
  @Input() link: string;
  @Input() backlink: string;
  @Input() collection: string;
  @Input() isHide: boolean;

  @Output() onDelete = new EventEmitter();
  @ViewChild('content') content: ElementRef;
  @ViewChild('editor') editor;
  @ViewChild('one', { static: false }) d1: ElementRef;
  modules = {};
  ismobile = false;

  constructor(
    public store: SettingStore,
    public ps: PrintService,
    public breakpointObserver: BreakpointObserver,

  ) {
    this.modules = {
      imageResize: {},
      syntax: false,
      toolbar: [
        [{ header: [1, 2, false] }],
        ['bold', 'italic', 'underline'],
        ['formula'],
        ['image', 'code-block']
      ]
    }
  }

  
  ngOnInit() {
    this.breakpointObserver
      .observe(['(max-width: 736px)'])
      .subscribe((state: BreakpointState) => {
        if (state.matches) {
          this.ismobile = state.matches;
        } else {
          this.ismobile = state.matches;
        }
      });
  }

  print() {
    this.ps.print('#print', 'a4');
  }

  // makePdf() {
  //   let data = document.getElementById('contentToConvert');
  //   var doc = new jsPDF('p', 'mm', 'a4')
  //   html2canvas(data).then(canvas => {
  //     var imgWidth = 208;
  //     var pageHeight = 295;
  //     var imgHeight = canvas.height * imgWidth / canvas.width;
  //     var heightLeft = imgHeight;
  //     const contentDataURL = canvas
  //     var position = 25;
  //     doc.text(10, 15, this.title)
  //     doc.line(200, 20, 10, 20)
  //     doc.setDrawColor(140)
  //     doc.setLineWidth(1)
  //     doc.addImage(contentDataURL, '*', 0, position, imgWidth, imgHeight)
  //     doc.save(this.collection + '.pdf');
  //   });
  // }

  delete(item: any) {
    this.onDelete.emit(item);
  }

}
