import { Injectable } from '@angular/core';
declare var $: any;
import * as XLSX from 'xlsx';
// import 'jspdf-autotable';
@Injectable({providedIn:'root'})
export class PrintService {

  constructor() { }
  savepdf(title: any) {
    // let data = document.getElementById('contentToConvert');
    // var doc = new jsPDF('l', 'mm', 'a4')
    // html2canvas(data).then(canvas => {
    //   var imgWidth = 208;
    //   var pageHeight = 295;
    //   var imgHeight = canvas.height * imgWidth / canvas.width;
    //   var heightLeft = imgHeight;
    //   const contentDataURL = canvas
    //   var position = 25;
    //   doc.setFontSize(12)
    //   doc.text(5, 12, title)
    //   doc.setDrawColor(140)
    //   doc.line(300, 20, 0, 20)
    //   doc.setLineWidth(1)
    //   doc.addImage(contentDataURL, '*', 0, position, imgWidth, imgHeight)
    //   doc.save(title + '.pdf');
    // });
    // doc.setFontSize(12)
    // doc.text(15, 10, title)
    // doc.setDrawColor(140)
    // doc.line(300, 12, 0, 12)
    // doc.setLineWidth(1)
    // doc.autoTable({ html: '#contentToConvert' });
    // doc.save(title + new  Date().getTime() + '.pdf');

  }
  exportExcel(tablename: string, table: any) {
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(table.nativeElement);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, tablename);
    XLSX.writeFile(wb, tablename + new  Date().getTime() + '.xlsx');
  }

  print(section: any, size: any) {
    switch (size) {
      case 'a5':
        $(section).print({
          globalStyles: true,
          mediaPrint: true,
          stylesheet: "/../assets/styles/a5.css",
          iframe: true,
          timeout: 5000,
          append: null,
          prepend: null,
          manuallyCopyFormValues: true,
          deferred: $.Deferred(),
          title: null,
          noPrintSelector: ".no-print",
          doctype: '<!doctype html>'
        });
        break;
      case 'a4':
        $(section).print({
          globalStyles: true,
          mediaPrint: true,
          stylesheet: "./../../../assets/styles/a4.css",
          iframe: true,
          timeout: 500,
          append: null,
          prepend: null,
          manuallyCopyFormValues: true,
          deferred: $.Deferred(),
          title: null,
          noPrintSelector: ".no-print",
          doctype: '<!doctype html>'
        })
        break;
      case 'a4-criminal':
          $(section).print({
            globalStyles: true,
            mediaPrint: true,
            stylesheet: "./../../../assets/styles/a4-criminal.css",
            iframe: true,
            timeout: 500,
            append: null,
            prepend: null,
            manuallyCopyFormValues: true,
            deferred: $.Deferred(),
            title: null,
            noPrintSelector: ".no-print",
            doctype: '<!doctype html>'
          })
          break;
      case 'a4l':
        $(section).print({
          globalStyles: true,
          mediaPrint: true,
          stylesheet: "/../assets/styles/a4l.css",
          iframe: true,
          timeout: 5000,
          append: null,
          prepend: null,
          manuallyCopyFormValues: true,
          deferred: $.Deferred(),
          title: null,
          noPrintSelector: ".no-print",
          doctype: '<!doctype html>'
        })
        break;
      case 'a5l':
        $(section).print({
          globalStyles: true,
          mediaPrint: true,
          stylesheet: "/../assets/styles/a5l.css",
          iframe: true,
          timeout: 5000,
          append: null,
          prepend: null,
          manuallyCopyFormValues: true,
          deferred: $.Deferred(),
          title: null,
          noPrintSelector: ".no-print",
          doctype: '<!doctype html>'
        })
        break;
      case 'rp':
        $(section).print({
          globalStyles: false,
          mediaPrint: true,
          stylesheet: "/../assets/styles/rollpaper.css",
          iframe: true,
          timeout: 5000,
          append: null,
          prepend: null,
          manuallyCopyFormValues: true,
          deferred: $.Deferred(),
          title: null,
          noPrintSelector: ".no-print",
          doctype: '<!doctype html>'
        })
        break;
      case 'a4-info-history':
        $(section).print({
          globalStyles: true,
          mediaPrint: true,
          stylesheet: "./../../../assets/styles/a4-info-history.css",
          iframe: true,
          timeout: 500,
          append: null,
          prepend: null,
          manuallyCopyFormValues: true,
          deferred: $.Deferred(),
          title: null,
          noPrintSelector: ".no-print",
          doctype: '<!doctype html>'
        })
        break;
      case 'a4-print-all':
        $(section).print({
          globalStyles: true,
          mediaPrint: true,
          stylesheet: "/../assets/styles/a4-print-all.css",
          iframe: true,
          timeout: 5000,
          append: null,
          prepend: null,
          manuallyCopyFormValues: true,
          deferred: $.Deferred(),
          title: null,
          noPrintSelector: ".no-print",
          doctype: '<!doctype html>'
        })
        break;
      case 'a4-2':
        $(section).print({
          globalStyles: true,
          mediaPrint: true,
          stylesheet: "./../../../assets/styles/a4-2.css",
          iframe: true,
          timeout: 500,
          append: null,
          prepend: null,
          manuallyCopyFormValues: true,
          deferred: $.Deferred(),
          title: null,
          noPrintSelector: ".no-print",
          doctype: '<!doctype html>'
        })
        break;
        case 'a4-2l':
          $(section).print({
            globalStyles: true,
            mediaPrint: true,
            stylesheet: "./../../../assets/styles/a4-2l.css",
            iframe: true,
            timeout: 500,
            append: null,
            prepend: null,
            manuallyCopyFormValues: true,
            deferred: $.Deferred(),
            title: null,
            noPrintSelector: ".no-print",
            doctype: '<!doctype html>'
          })
          break;
      default:
        break;
    }
  }
}
