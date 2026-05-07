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
  PvpFoundationDiagnostic,
  PvpFoundationDiagnosticAdmin,
} from '../../../core/services/pvp/pvp-foundation-diagnostic-admin';
import { ActiveServer } from '../../../core/services/server/active-server';
import { getErrorMessage } from '../../../core/utils/error-message';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { PVP_FOUNDATION_DIAGNOSTIC_PAGE_LINKS } from '../../admin-navigation.config';
import { AdminSectionIntro } from '../../components/admin-section-intro/admin-section-intro';
import { AdminTagLinks } from '../../components/admin-tag-links/admin-tag-links';

@Component({
  selector: 'app-pvp-foundation-diagnostic-page',
  standalone: true,
  imports: [AdminSectionIntro, AdminTagLinks, LoadingOverlay],
  templateUrl: './pvp-foundation-diagnostic-page.html',
})
export class PvpFoundationDiagnosticPage implements OnInit {
  private readonly diagnosticAdmin = inject(PvpFoundationDiagnosticAdmin);
  private readonly activeServer = inject(ActiveServer);
  private readonly destroyRef = inject(DestroyRef);

  readonly links = PVP_FOUNDATION_DIAGNOSTIC_PAGE_LINKS;
  readonly diagnostic = signal<PvpFoundationDiagnostic | null>(null);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly selectedServer = this.activeServer.selectedServer;
  readonly blockerCount = computed(() =>
    this.diagnostic()
      ? this.diagnostic()!.missingFunctions.length
        + this.diagnostic()!.missingTriggers.length
      : 0,
  );
  readonly smokePrerequisiteCount = computed(() =>
    this.diagnostic()?.positiveSmokePrerequisites.length ?? 0,
  );
  readonly incomingNotificationCount = computed(() =>
    this.diagnostic()?.incomingNotificationCount,
  );
  readonly hasDiagnostic = computed(() => this.diagnostic() !== null);

  ngOnInit(): void {
    this.loadDiagnostic();
  }

  statusBadgeClass(status: string | null): string {
    if (!status) {
      return 'tag-badge tag-badge--warn';
    }

    return status.toLowerCase() === 'ok'
      ? 'tag-badge tag-badge--info'
      : 'tag-badge tag-badge--warn';
  }

  statusLabel(status: string | null): string {
    return status ?? 'not returned';
  }

  private loadDiagnostic(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.diagnostic.set(null);

    this.diagnosticAdmin.getDiagnostic(this.selectedServer()?.id ?? null)
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (diagnostic) => this.diagnostic.set(diagnostic),
        error: (error: unknown) =>
          this.error.set(
            getErrorMessage(
              error,
              'Failed to load PvP foundation diagnostic.',
            ),
          ),
      });
  }
}
