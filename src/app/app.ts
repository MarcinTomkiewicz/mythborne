import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GameSidebar } from "./features/layout/game-sidebar/game-sidebar";
import { PrimeNG } from 'primeng/config';
import { Auth } from './auth/services/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GameSidebar],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'mythos-hunter-2-0';

    private auth = inject(Auth);

  ngOnInit() {
    this.auth.initializeAuthState().subscribe({
      next: () => console.log('[Auth] 🔄 Session restored'),
      error: err => console.error('[Auth] ❌ Failed to restore session', err)
    });
  }
}
