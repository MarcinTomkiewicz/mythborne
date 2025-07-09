import { CommonModule } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthState } from '../../../auth/services/auth-state';
import { MENU_GUEST, MENU_LOGGED_IN } from '../../../core/config/menu-config';
import { Login } from '../../../auth/components/login/login';
import { Auth } from '../../../auth/services/auth';

interface MenuItem {
  title: string;
  url: string;
  icon: string;
}

@Component({
  selector: 'app-game-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive, Login],
  templateUrl: './game-sidebar.html',
  styleUrl: './game-sidebar.scss'
})
export class GameSidebar {
  collapsed = input<boolean>(false);

  private authState = inject(AuthState);
  private auth = inject(Auth);

  readonly user = this.authState.user;
  readonly hero = this.authState.hero;

  readonly isLoggedIn = computed(() => !!this.user());

  readonly menuItems = computed(() =>
    this.isLoggedIn() ? MENU_LOGGED_IN : MENU_GUEST
  );

  handleLogin({ email, password }: { email: string; password: string }) {
  this.auth.login(email, password).subscribe({
    next: () => console.log('[Sidebar] ✅ Zalogowano'),
    error: (err) => console.error('[Sidebar] ❌ Login error', err),
  });
}
}

