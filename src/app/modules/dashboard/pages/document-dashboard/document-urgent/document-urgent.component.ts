import { Component, Input, OnInit } from '@angular/core';
import { IHeaderInformation } from 'src/app/interfaces/document/document.interface';
import { SwiperOptions } from 'swiper';

@Component({
  selector: 'app-document-urgent',
  templateUrl: './document-urgent.component.html',
  styleUrls: ['./document-urgent.component.scss']
})
export class DocumentUrgentComponent implements OnInit {
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
  
  constructor(
  ) { }

  ngOnInit(): void {
    
  }

}
