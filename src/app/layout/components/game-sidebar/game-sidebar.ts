import { CommonModule } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { LoginForm } from '../../../auth/components/login-form/login-form';
import { MENU_GUEST, MENU_LOGGED_IN } from '../../../core/config/menu-config';
import { Auth } from '../../../core/services/auth/auth';
import { AuthState } from '../../../core/services/auth/auth-state';

@Component({
  selector: 'app-game-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive, LoginForm],
  templateUrl: './game-sidebar.html',
  styleUrl: './game-sidebar.scss',
})
export class GameSidebar {
  collapsed = input<boolean>(false);

  private readonly authState = inject(AuthState);
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  readonly user = this.authState.user;
  readonly hero = this.authState.hero;
  readonly isLoggedIn = computed(() => !!this.user());
  readonly menuItems = computed(() =>
    this.isLoggedIn() ? MENU_LOGGED_IN : MENU_GUEST
  );

  handleLogin({ email, password }: { email: string; password: string }) {
    this.auth.login(email, password).subscribe({
      next: () => {
        void this.router.navigateByUrl(
          this.authState.hero() ? '/hero/dashboard' : '/auth/create-character'
        );
      },
      error: (error) => console.error('[Sidebar] Login error', error),
    });
  }
}
