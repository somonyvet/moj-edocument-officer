import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { AnimationItem } from 'lottie-web';
import { AnimationOptions } from 'ngx-lottie';
import { ProjectStore } from 'src/app/stores/project/project.store';

class ISidebarHeaderOption{
  title: string;
  subTitle: string;
  dotStatus : any;
  isSetting: boolean;
}

@Component({
  selector: 'app-project-sidebar-head',
  templateUrl: './project-sidebar-head.component.html',
  styleUrls: ['./project-sidebar-head.component.scss']
})

export class ProjectSidebarHeadComponent implements OnInit, OnChanges {
  // @Input() title: string;
  // @Input() subTitle: string;
  // @Input() dotStatus : any;
  // @Input() isSetting: boolean;
  @Input() options: ISidebarHeaderOption;
  @Input() list: any;
  @Input() selectedProject: any;

  @Output() onSelectedItem = new EventEmitter<any>();
  @Output() onSelectedYear = new EventEmitter<any>();

  @ViewChild('searchSupplier') searchSupplier: ElementRef;

  projectList = null;

  focusSearch = false;
  searchString = '';
  selectedSupplierId = null;
  searchInterval = null;
  isAnimationCreated: boolean = false;
  years = null

  searchEmptyResult = false;
  searchResult = null;

  isEmptyResult = false;
  loadingProject = true;

  lottie: AnimationOptions = {
    path: '/assets/animate/lf30_editor_m4yztuw4.json',
  };

  constructor(
    public store : ProjectStore,
  ) {}

  ngOnInit() {
  }


  onProjectOpened(){
    this.store.fetchProjects(res => {
      this.loadingProject = false;
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes?.list){
      this.projectList = changes?.list?.currentValue
    }
  }

  animationCreated(event: AnimationItem): void {
    this.isAnimationCreated = true;
  }

  onSelectYear(item){
    this.onSelectedYear.emit(item)
  }

  onSelectItem(item){
    this.onSelectedItem.emit(item)
  }

  onFocusSearch() {
    this.focusSearch = true;
    this.searchSupplier.nativeElement.focus()
  }
  onOutFocusSearch() {
    this.focusSearch = false;
  }

  onCloseSearch() {
    this.searchString = null
    this.focusSearch = false;
    this.searchResult = [];
  }

  setEmptyResult(){
    this.isEmptyResult = false;
  }
  onInput(event){
    this.isEmptyResult = true;
  }

  setStyleBtnCancel() {
    if (this.focusSearch || this.searchString) {
      return {
        transform: 'translateX(-27px)',
        opacity: 1,
      }
    } else {
      return {
        transform: 'translateX(0)',
        opacity: 0,
      }
    }
  }
  setStyleSearchBox() {
    if (this.focusSearch || this.searchString) {
      return {
        margin : '12px 0',
        padding : '0 16px',
      }
    } else {
      return {}
    }
  }

  setStyleSearchResult() {
    if (this.focusSearch || this.searchString) {
      return {
        position: 'absolute',
        top: '70px',
        left: '0',
        height: 'auto',
        width: '100%',
        'box-shadow': '2px 16px 12px 2px lightgrey',
        'border-bottom-left-radius': '6px',
        'border-bottom-right-radius': '6px',
      }
    } else {
      return {}
    }
  }

  setBoxShadowHead(){
    if (this.focusSearch || this.searchString) {
      return {
        'box-shadow': '2px 2px 12px 2px lightgrey',
      }
    } else {
      return {}
    }
  }
  setFillGap(){
    if (this.focusSearch || this.searchString) {
      return {
        display:'block',
      }
    } else {
      return {
        display:'none',
      }
    }
  }


}
