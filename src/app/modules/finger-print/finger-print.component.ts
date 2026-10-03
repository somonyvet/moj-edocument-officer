import { Component, OnInit } from '@angular/core';
import { AuthStore } from 'src/app/stores/auth.store';
declare function load():any;
declare function onSelectScan():any;
declare function selectScanObject():any;
declare function captureFP(result:any):any;


@Component({
  selector: 'app-finger-print',
  templateUrl: './finger-print.component.html',
  styleUrls: ['./finger-print.component.scss']
})
export class FingerPrintComponent implements OnInit {

  imgBase64 = null
  dataImg = null
  constructor(private auth: AuthStore) { }

  ngOnInit(): void {
    load();
  }


  onSelectScanChange(){
    onSelectScan()
  }

  selectScanObjectChange(){
    selectScanObject()
  }

  onCaptureFP(){
    captureFP(result=>{
      if(result && result.length > 0){
        const imgItem = result[0]?.Outputs[0]
        this.imgBase64 = imgItem?.Base64Data 
        this.dataImg = `data:image/bmp;base64,${this.imgBase64}`
        const fileName = 'fingerprint.bmp'
        const type = 'image'
        this.auth.uploadBase64(fileName,type,this.dataImg)
      }
      
    })
  }
}
