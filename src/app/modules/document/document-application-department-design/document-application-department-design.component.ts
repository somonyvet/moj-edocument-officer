import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentStore } from 'src/app/stores/document/document.store';

@Component({
  selector: 'app-document-application-department-design',
  templateUrl: './document-application-department-design.component.html',
  styleUrls: ['./document-application-department-design.component.scss']
})
export class DocumentApplicationDepartmentDesignComponent implements OnInit,OnDestroy {
  param:any=null;
  loading:boolean=true;
  constructor(private route:ActivatedRoute,
    public store: DocumentStore,
    ) { }

  ngOnInit(): void {
    this.route.params.subscribe(param => {
      const {id, cid}=param;
      this.param=param;
      this.store.fetchDocumentsDoc(id,res=>{
        this.store.fetchChildDoc(cid,res=>{
          this.loading=false;
        })
      })

    })
  }

  ngOnDestroy(){

  }

}
