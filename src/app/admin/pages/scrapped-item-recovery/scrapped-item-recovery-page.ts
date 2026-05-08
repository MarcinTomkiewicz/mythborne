import { Component, DestroyRef, OnInit, computed, effect, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { RecoverableScrappedItem } from '../../../core/domain/item/item-lifecycle.model';
import { ActiveServer } from '../../../core/services/server/active-server';
import { ScrappedItemRecoveryState } from '../../../core/services/items/scrapped-item-recovery.state';
import { resolveStaffAccessPolicy } from '../../../core/utils/staff-access-policy';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { SCRAPPED_ITEM_RECOVERY_PAGE_LINKS } from '../../admin-navigation.config';
import { AdminReasonPresetField } from '../../components/admin-reason-preset-field/admin-reason-preset-field';
import { AdminServerSwitcher } from '../../components/admin-server-switcher/admin-server-switcher';
import { AdminTagLinks } from '../../components/admin-tag-links/admin-tag-links';

@Component({
  selector: 'app-scrapped-item-recovery-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    MessageModule,
    LoadingOverlay,
    AdminReasonPresetField,
    AdminServerSwitcher,
    AdminTagLinks,
  ],
  providers: [ScrappedItemRecoveryState],
  templateUrl: './scrapped-item-recovery-page.html',
})
export class ScrappedItemRecoveryPage implements OnInit {
  private readonly activeServer = inject(ActiveServer);
  private readonly destroyRef = inject(DestroyRef);

  readonly recovery = inject(ScrappedItemRecoveryState);
  readonly links = SCRAPPED_ITEM_RECOVERY_PAGE_LINKS;
  readonly selectedServer = this.activeServer.selectedServer;
  readonly selectedServerId = computed(() => this.selectedServer()?.id ?? null);
  readonly policy = computed(() =>
    resolveStaffAccessPolicy({
      access: this.activeServer.access(),
      selectedServer: this.selectedServer(),
    }),
  );
  readonly canRecover = computed(() =>
    this.policy().isGlobalAdmin || this.policy().canManageSelectedServer,
  );

  private hasInitialized = false;
  private lastServerId: string | null = null;

  constructor() {
    effect(() => {
      const serverId = this.selectedServerId();

      if (serverId === this.lastServerId) {
        return;
      }

      this.lastServerId = serverId;
      this.recovery.reset();

      if (this.hasInitialized && serverId && this.canRecover()) {
        this.search();
      }
    });
  }

  ngOnInit(): void {
    this.hasInitialized = true;

    if (this.activeServer.servers().length === 0 && !this.activeServer.isLoading()) {
      this.activeServer
        .loadAccessibleServers()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe();
      return;
    }

    this.search();
  }

  search(): void {
    this.recovery.search(this.selectedServerId(), this.canRecover());
  }

  recover(item: RecoverableScrappedItem): void {
    this.recovery.recover(item, this.selectedServerId(), this.canRecover());
  }
}
