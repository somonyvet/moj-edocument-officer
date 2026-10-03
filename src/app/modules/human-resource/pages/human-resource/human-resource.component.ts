import { Component, OnInit } from '@angular/core';
import { HrStore } from '../../stores/hr.store';

@Component({
  selector: 'app-human-resource',
  templateUrl: './human-resource.component.html',
  styleUrls: ['./human-resource.component.scss']
})
export class HumanResourceComponent implements OnInit {
  apps_items = [
    { key: `officers`, icon: `people`, toolTip: `សាលាកបត្រព័ត៌មាន`, url: `/hr/officers` },
    // { key: `calendar`, icon: `calendar`, toolTip: `ប្រតិទិន`, url: `/hr/calendar` },
    // { key: `todo`, icon: `checkmark-circle`, toolTip: `កិច្ចការ`, url: `/hr/todo` },
  ]
  constructor(
    public store : HrStore
  ) { }

  ngOnInit(): void {
  }

}
