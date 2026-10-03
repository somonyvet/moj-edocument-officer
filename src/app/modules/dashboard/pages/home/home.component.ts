import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { STATUS_OBJ } from 'src/app/dummy/appinfo';
import { AuthStore } from 'src/app/stores/auth.store';
import { MemoStore } from 'src/app/stores/document/memo.store';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  apps_items = [
    { key: `documents`, icon: `mail`, toolTip: `ឯកសារឌីជីថល`, url: `/edoc/documents` },
    // { key: `calendar`, icon: `calendar`, toolTip: `ប្រតិទិន`, url: `` },
    // { key: `contact`, icon: `people`, toolTip: `ទំនាក់ទំនង`, url: `` },
    // { key: `todo`, icon: `checkmark-circle`, toolTip: `កិច្ចការ`, url: `` },
    { key: `account`, icon: `person`, toolTip: `ប្រវត្តិរូបនគរបាលជាតិ`, url: `/hr/officers/applications/listing` },
  ]

  toggleBar: boolean = false;


  constructor(
    public store: MemoStore,
    private auth: AuthStore,
    private router: Router,
  ) { }

  ngOnInit(): void {
    const { profile, uid } = this.auth;
    // this.apps_items = this.apps_items.map(item => {
    //   if (item?.key === 'account') {
    //     return { ...item, url: `/hr/officers/applications/listing/${uid}` }
    //   }
    //   return item;
    // })
    // if (profile?.status?.key === STATUS_OBJ.PENDING.key) {
    //   this.router.navigate([`/hr/officer-application-form/${uid}`])
    // }
  }

}
