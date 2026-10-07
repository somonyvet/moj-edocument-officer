import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MemoStore } from 'src/app/stores/document/memo.store';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class HomeComponent implements OnInit {
  apps_items = [
    // { key: `home`, icon: `home`, toolTip: `ទំព័រដើម`, url: `/mme/home` },
    { key: `approval`, icon: `layers`, toolTip: `អនុម័តលើផែនការប្រចាំត្រីមាស និងរបាយការណ៍ប្រចាំខែ`, url: `/mme/approval` },
    { key: `report`, icon: `reader`, toolTip: `របាយការណ៍ប្រចាំខែ`, url: `/mme/report` },
    { key: `planing`, icon: `briefcase`, toolTip: `ផែនការប្រចាំឆ្នាំ`, url: `/mme/planing` },
    { key: `settings`, icon: `apps`, toolTip: `ប្រព័ន្ធទិន្នន័យ`, url: `/mme/settings` },
  ]

  toggleBar: boolean = false;


  constructor(
    public store : MemoStore,
  ) { }

  ngOnInit(): void {
  }

}
