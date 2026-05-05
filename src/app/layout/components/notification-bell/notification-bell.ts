import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NotificationBellState } from './notification-bell.state';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [RouterLink],
  providers: [NotificationBellState],
  templateUrl: './notification-bell.html',
})
export class NotificationBell implements OnInit {
  readonly state = inject(NotificationBellState);

  ngOnInit(): void {
    this.state.init();
  }
}
