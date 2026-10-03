import { Component, Input, OnInit } from '@angular/core';
import { AuthStore } from 'src/app/stores/auth.store';

@Component({
  selector: 'app-folder-report',
  templateUrl: './folder-report.component.html',
  styleUrls: ['./folder-report.component.scss']
})
export class FolderReportComponent implements OnInit {
  @Input() folderData : any = null;

  constructor(
    public auth : AuthStore,
  ) { }

  ngOnInit(): void {
    const b = 25 - this.folderData?.recordsData?.length;
    if(this.folderData?.recordsData?.length < 25){
      for (let i = 0; i < b; i++) {
        this.folderData?.recordsData.push({
          pushField: null,
        })
      }
    }
  }
}
