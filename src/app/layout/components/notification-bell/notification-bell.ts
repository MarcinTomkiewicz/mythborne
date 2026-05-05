import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NotificationActionRoutePolicy } from './notification-action-route-policy';
import { NotificationBellActionRunner } from './notification-bell-action-runner';
import { NotificationBellDisplayFormatter } from './notification-bell-display-formatter';
import { NotificationFreshToastPresenter } from './notification-fresh-toast-presenter';
import { NotificationBellState } from './notification-bell.state';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [RouterLink],
  providers: [
    NotificationActionRoutePolicy,
    NotificationBellActionRunner,
    NotificationBellDisplayFormatter,
    NotificationBellState,
    NotificationFreshToastPresenter,
  ],
  templateUrl: './notification-bell.html',
})
export class NotificationBell implements OnInit {
  readonly state = inject(NotificationBellState);

  ngOnInit(): void {
    this.state.init();
  }
}
