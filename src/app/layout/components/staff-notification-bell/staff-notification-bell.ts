import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NotificationBellDisplayFormatter } from '../notification-bell/notification-bell-display-formatter';
import { DropdownOutsideClose } from '../topbar-dropdown/topbar-dropdown-coordinator';
import { StaffNotificationActionRoutePolicy } from './staff-notification-action-route-policy';
import { StaffNotificationBellState } from './staff-notification-bell.state';

@Component({
  selector: 'app-staff-notification-bell',
  standalone: true,
  imports: [RouterLink, DropdownOutsideClose],
  providers: [
    NotificationBellDisplayFormatter,
    StaffNotificationActionRoutePolicy,
    StaffNotificationBellState,
  ],
  templateUrl: './staff-notification-bell.html',
})
export class StaffNotificationBell implements OnInit {
  readonly state = inject(StaffNotificationBellState);

  ngOnInit(): void {
    this.state.init();
  }
}
