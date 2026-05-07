import {
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import {
  PvpActionKindEntry,
  PvpActionStatusEntry,
} from '../../../core/domain/pvp/pvp.model';
import {
  PvpActionLifecycleAdmin,
  PvpActionLifecycleAdminData,
} from '../../../core/services/pvp/pvp-action-lifecycle-admin';
import { getErrorMessage } from '../../../core/utils/error-message';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { PVP_ACTION_LIFECYCLE_PAGE_LINKS } from '../../admin-navigation.config';
import { AdminSectionIntro } from '../../components/admin-section-intro/admin-section-intro';
import { AdminTagLinks } from '../../components/admin-tag-links/admin-tag-links';

@Component({
  selector: 'app-pvp-action-lifecycle-page',
  standalone: true,
  imports: [AdminSectionIntro, AdminTagLinks, LoadingOverlay],
  templateUrl: './pvp-action-lifecycle-page.html',
})
export class PvpActionLifecyclePage implements OnInit {
  private readonly lifecycle = inject(PvpActionLifecycleAdmin);
  private readonly destroyRef = inject(DestroyRef);

  readonly links = PVP_ACTION_LIFECYCLE_PAGE_LINKS;
  readonly actionKinds = signal<PvpActionKindEntry[]>([]);
  readonly actionStatuses = signal<PvpActionStatusEntry[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly activeActionKindCount = computed(() =>
    this.actionKinds().filter((kind) => kind.isActive).length,
  );
  readonly futureActionKindCount = computed(() =>
    this.actionKinds().filter((kind) => !kind.isActive).length,
  );
  readonly blockingStatusCount = computed(() =>
    this.actionStatuses().filter((status) => status.isBlocking).length,
  );
  readonly terminalStatusCount = computed(() =>
    this.actionStatuses().filter((status) => status.isTerminal).length,
  );

  ngOnInit(): void {
    this.loadData();
  }

  actionKindBadgeClass(kind: PvpActionKindEntry): string {
    return kind.isActive
      ? 'tag-badge tag-badge--info'
      : 'tag-badge tag-badge--warn';
  }

  actionKindStateLabel(kind: PvpActionKindEntry): string {
    return kind.isActive ? 'active' : 'future/inactive';
  }

  actionKindTypeBadges(kind: PvpActionKindEntry): string[] {
    return [
      kind.createsCombat ? 'combat' : null,
      kind.createsRuntimeActivity ? 'runtime activity' : null,
      kind.createsSpyResult ? 'spy result' : null,
      kind.isTravelAction ? 'travel' : null,
    ].filter((badge): badge is string => badge !== null);
  }

  statusBadgeClass(status: PvpActionStatusEntry): string {
    if (status.isTerminal) {
      return 'tag-badge tag-badge--info';
    }

    return status.isBlocking
      ? 'tag-badge tag-badge--warn'
      : 'tag-badge tag-badge--muted';
  }

  statusLifecycleLabel(status: PvpActionStatusEntry): string {
    if (status.isTerminal) {
      return 'terminal';
    }

    return status.isBlocking ? 'blocking' : 'non-blocking';
  }

  private loadData(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.lifecycle.getData()
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (data) => this.applyData(data),
        error: (error: unknown) =>
          this.error.set(
            getErrorMessage(error, 'Failed to load PvP action lifecycle.'),
          ),
      });
  }

  private applyData(data: PvpActionLifecycleAdminData): void {
    this.actionKinds.set(data.actionKinds);
    this.actionStatuses.set(data.actionStatuses);
  }
}
