import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthState } from '../../core/services/auth/auth-state';
import { ActiveHero } from '../../core/services/hero/active-hero';
import { ActiveServer } from '../../core/services/server/active-server';
import { SessionLogoutButton } from '../../shared/session-logout-button/session-logout-button';

@Component({
  selector: 'app-account-entry-layout',
  standalone: true,
  host: {
    class: 'd-block w-100',
    style: 'width: 100%; min-width: 0; flex: 1 1 auto; align-self: stretch;',
  },
  imports: [RouterLink, RouterLinkActive, RouterOutlet, SessionLogoutButton],
  templateUrl: './account-entry-layout.html',
})
export class AccountEntryLayout {
  private readonly activeHero = inject(ActiveHero);
  private readonly activeServer = inject(ActiveServer);
  private readonly authState = inject(AuthState);

  readonly accountLabel = computed(
    () => this.authState.user()?.email ?? 'Zalogowane konto',
  );
  readonly selectedServerName = computed(
    () => this.activeServer.selectedServer()?.name ?? null,
  );
  readonly activeHeroName = computed(
    () => this.activeHero.state()?.hero?.name ?? null,
  );
}
