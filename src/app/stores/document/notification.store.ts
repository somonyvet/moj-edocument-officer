import { observable, action, } from 'mobx';
import { Injectable } from '@angular/core';
import { INotification } from 'src/app/interfaces/document/document.interface';
import { Subscription } from 'rxjs';
import { DatabaseService } from 'src/app/shared/services/database.service';

@Injectable({ providedIn: 'root' })
export class NotificationStore {
  @observable notifications: any = [];
  @observable process: boolean = false;
  @observable loading: boolean = true;
  @observable fetching: boolean = false;
  @observable empty: boolean = false;
  @observable lastVisible: INotification = null;

  constructor(
    private ds: DatabaseService,
  ) { }

  @action
  async subscribe() {
    this.fetchNotificationRef && this.fetchNotificationRef.unsubscribe()
    this.notifications = [];
  }

  @observable fetchNotificationRef: Subscription = null;
  @action
  fetchData(uid: string, workplaceKey: string) {
    this.fetchNotificationRef && this.fetchNotificationRef.unsubscribe()
    const keys: string[] = [uid, workplaceKey, '___PUBLIC___'];
    this.fetchNotificationRef = this.ds.notificationsRef(ref => ref
      .where('notifyTo', 'array-contains-any', keys)
      .orderBy("created_at", "desc")
      .limit(12)
    ).valueChanges().subscribe(data => {
      this.notifications = data;
      if (data.length >= 12) {
        this.lastVisible = this.notifications[this.notifications.length - 1]
      } else {
        this.lastVisible = null
      }
      this.loading = false;
    })
  }

  @action
  fetchMore(uid: string, workplaceKey: string) {
    try {
      if (!this.lastVisible) {
        return;
      } else {
        this.fetching = true;
        this.loading = true;
        this.fetchNotificationRef && this.fetchNotificationRef.unsubscribe()
        this.fetchNotificationRef = this.ds.notificationsRef(ref => {
          let condition = ref.where('notifyTo', 'array-contains-any', [uid, workplaceKey]).orderBy("created_at", "desc").limit(12)
          if (this.lastVisible) {
            const { created_at } = this.lastVisible
            condition = condition.startAfter(created_at)
          }
          return condition
        }).valueChanges().subscribe(data => {
          this.notifications = this.notifications.concat(data)
          if (data.length >= 12) {
            this.lastVisible = this.notifications[this.notifications.length - 1]
          } else {
            this.lastVisible = null
          }
          this.loading = false;
          this.fetching = false;
        })
      }
    } catch (e) {
    }
  }

}
