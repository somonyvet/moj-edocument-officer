import { Component, OnInit, Inject } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-app-scan-qr-code',
  templateUrl: './app-scan-qr-code.component.html',
  styleUrls: ['./app-scan-qr-code.component.scss']
})
export class AppScanQrCodeComponent implements OnInit {

  public qrCodeText: string = null;
  constructor(
    private deviceService: DeviceDetectorService,
    @Inject(DOCUMENT) private document: any
  ) { 
    this.qrCodeText = 'https://crofficer.moj.gov.kh/app-scan-qr-code';
  }

  ios = "https://install.appcenter.ms/users/sokveasna/apps/edoc-moj/distribution_groups/public"
  android = "https://install.appcenter.ms/users/sokveasna/apps/edoc-moj-1/distribution_groups/public"
  ngOnInit() {
    const isMobile = this.deviceService.isMobile();
    if(isMobile){
      if(this.deviceService.getDeviceInfo().device === "iPhone")
        this.document.location.href = this.ios;
      if(this.deviceService.getDeviceInfo().device === "Android")
        this.document.location.href = this.android;
    }
  }

}
