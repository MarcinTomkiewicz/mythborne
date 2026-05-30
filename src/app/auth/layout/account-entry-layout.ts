import { Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  ACCOUNT_ENTRY_SIDEBAR_CONTEXT_ROWS,
  ACCOUNT_ENTRY_SIDEBAR_NAV_GROUPS,
} from '../../core/config/account-entry-sidebar.config';
import {
  AccountEntrySidebarContextKey,
  SidebarContextRow,
} from '../../core/interfaces/layout/sidebar.interface';
import { AuthState } from '../../core/services/auth/auth-state';
import { ActiveHero } from '../../core/services/hero/active-hero';
import { ActiveServer } from '../../core/services/server/active-server';
import { ShellSidebarContent } from '../../layout/components/shell-sidebar-content/shell-sidebar-content';

@Component({
  selector: 'app-account-entry-layout',
  standalone: true,
  host: {
    class: 'd-block w-100',
  },
  imports: [RouterOutlet, ShellSidebarContent],
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
  readonly contextRows = computed<SidebarContextRow[]>(() =>
    ACCOUNT_ENTRY_SIDEBAR_CONTEXT_ROWS.map((row) => ({
      label: row.label,
      value: this.contextValue(row.key),
    })),
  );
  readonly navGroups = ACCOUNT_ENTRY_SIDEBAR_NAV_GROUPS;

  private contextValue(key: AccountEntrySidebarContextKey): string {
    switch (key) {
      case 'account':
        return this.accountLabel();
      case 'server':
        return this.selectedServerName() ?? 'Nie wybrano serwera';
      case 'hero':
        return this.activeHeroName() ?? 'Nie wybrano bohatera';
    }
  }
}
