import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SelectChangeEvent, SelectModule } from 'primeng/select';
import { finalize } from 'rxjs';
import { ActiveServerFormFactory } from '../../../core/factories/forms/active-server-form.factory';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { ActiveServer } from '../../../core/services/server/active-server';
import {
  membershipStatusLabel,
  membershipStatusReason,
} from '../../../core/utils/server-membership';

@Component({
  selector: 'app-admin-server-switcher',
  standalone: true,
  imports: [ReactiveFormsModule, SelectModule],
  templateUrl: './admin-server-switcher.html',
})
export class AdminServerSwitcher implements OnInit {
  private readonly activeServer = inject(ActiveServer);
  private readonly activeHero = inject(ActiveHero);
  private readonly formFactory = inject(ActiveServerFormFactory);

  readonly form = this.formFactory.createSelectorForm();
  readonly servers = this.activeServer.servers;
  readonly selectedServer = this.activeServer.selectedServer;
  readonly access = this.activeServer.access;
  readonly isLoading = this.activeServer.isLoading;
  readonly error = this.activeServer.error;
  readonly canSwitchServer = computed(
    () =>
      this.access().canManageSelectedServer ||
      this.access().isAdmin ||
      this.access().isOperator
  );
  readonly selectedServerId = computed(() => this.selectedServer()?.id ?? '');
  readonly isSelectDisabled = computed(() => this.isLoading() || this.isSwitching());
  readonly membershipStatusLabel = computed(() =>
    membershipStatusLabel(this.access().membershipStatus),
  );
  readonly membershipStatusReason = computed(() =>
    membershipStatusReason(this.access().membership),
  );
  readonly serverOptions = computed(() =>
    this.servers().map((server) => ({
      label: `${server.name} (${server.kind} / ${server.status})`,
      value: server.id,
    }))
  );
  readonly isSwitching = signal(false);

  constructor() {
    effect(() => {
      this.form.patchValue(
        { selectedServerId: this.selectedServerId() },
        { emitEvent: false }
      );
    });

    effect(() => {
      this.syncFormDisabledState();
    });
  }

  ngOnInit(): void {
    if (this.servers().length === 0 && !this.isLoading()) {
      this.activeServer.loadAccessibleServers().subscribe();
    }
  }

  selectServer(serverId: string): void {
    if (!serverId || serverId === this.selectedServerId() || this.isSwitching()) {
      return;
    }

    const didSelect = this.activeServer.selectServer(serverId);

    if (!didSelect) {
      return;
    }

    this.isSwitching.set(true);
    this.activeHero
      .loadActiveHero()
      .pipe(finalize(() => this.isSwitching.set(false)))
      .subscribe();
  }

  selectServerFromChange(event: SelectChangeEvent): void {
    this.selectServer(event.value ?? '');
  }

  private syncFormDisabledState(): void {
    if (this.isSelectDisabled() && this.form.enabled) {
      this.form.disable({ emitEvent: false });
      return;
    }

    if (!this.isSelectDisabled() && this.form.disabled) {
      this.form.enable({ emitEvent: false });
    }
  }
}
