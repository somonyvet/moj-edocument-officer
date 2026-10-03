import { Component, Input, OnInit } from '@angular/core';
import { IHeaderInformation } from 'functions/src/interfaces/interface';
import { SwiperOptions } from 'swiper';

@Component({
  selector: 'app-document-pined',
  templateUrl: './document-pined.component.html',
  styleUrls: ['./document-pined.component.scss']
})
export class DocumentPinedComponent implements OnInit {
  @Input() data:IHeaderInformation[];
  @Input() loading:boolean;
  
  img = "../../../../../../assets/images/doc-cover.jpg"
  config: SwiperOptions = {
    pagination: { el: '.swiper-pagination', clickable: true },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev'
    },
    spaceBetween: 30
  };
  constructor() { }

  ngOnInit(): void {
 
  }

}
