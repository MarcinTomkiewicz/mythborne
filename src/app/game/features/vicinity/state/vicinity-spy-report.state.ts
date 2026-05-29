import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, switchMap } from 'rxjs';
import { activeHeroContextKey } from '../../../../core/domain/hero/active-hero-context';
import { ActivePvpActionOffer } from '../../../../core/domain/pvp/pvp.model';
import { pvpActiveActionErrorMessage } from '../../../../core/domain/pvp/pvp-active-action-display.mapper';
import { ActiveHero } from '../../../../core/services/hero/active-hero';
import { PlayerPvp } from '../../../../core/services/pvp/player-pvp';
import { createRequestId } from '../../../../core/utils/request-id';
import { RequestToken } from '../../../../core/utils/request-token';

@Injectable()
export class VicinitySpyReportState {
  private readonly activeHero = inject(ActiveHero);
  private readonly destroyRef = inject(DestroyRef);
  private readonly playerPvp = inject(PlayerPvp);
  private readonly reportRequests = new RequestToken();
  private readonly reportActionId = signal<string | null>(null);

  readonly isPreparingReport = signal(false);
  readonly error = signal<string | null>(null);
  readonly reportId = signal<string | null>(null);

  prepare(offer: ActivePvpActionOffer): void {
    if (
      this.isPreparingReport()
      || this.reportActionId() === offer.pvpActionId
      || this.error()
    ) {
      return;
    }

    const requestId = this.reportRequests.next();
    const requestContextKey = activeHeroContextKey(this.activeHero.state());

    if (!requestContextKey) {
      this.error.set('Brak aktywnego bohatera do przygotowania raportu szpiegowania.');
      return;
    }

    this.reportActionId.set(offer.pvpActionId);
    this.reportId.set(null);
    this.isPreparingReport.set(true);
    this.error.set(null);

    this.playerPvp.settleDueSpyAction({
      pvpActionId: offer.pvpActionId,
      requestId: createRequestId(`pvp-spy:settle:${offer.pvpActionId}`),
    }).pipe(
      switchMap((settlement) => {
        if (!settlement.pvpSpyResultId) {
          throw new Error('missing_pvp_spy_result_id');
        }

        return this.playerPvp.createSpyGameReport({
          pvpSpyResultId: settlement.pvpSpyResultId,
          requestId: createRequestId(`pvp-spy:report:${settlement.pvpSpyResultId}`),
        });
      }),
      finalize(() => {
        if (
          this.reportRequests.isCurrent(requestId)
          && requestContextKey === activeHeroContextKey(this.activeHero.state())
        ) {
          this.isPreparingReport.set(false);
        }
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (report) => {
        if (
          !this.reportRequests.isCurrent(requestId)
          || requestContextKey !== activeHeroContextKey(this.activeHero.state())
        ) {
          return;
        }

        this.reportId.set(report.gameReportId);
      },
      error: (error: unknown) => {
        if (
          !this.reportRequests.isCurrent(requestId)
          || requestContextKey !== activeHeroContextKey(this.activeHero.state())
        ) {
          return;
        }

        this.error.set(
          error instanceof Error && error.message === 'missing_pvp_spy_result_id'
            ? 'Szpiegowanie zakończone, ale backend nie zwrócił wyniku do raportu.'
            : pvpActiveActionErrorMessage(
                error,
                'Nie udało się przygotować raportu szpiegowania.',
              ),
        );
      },
    });
  }

  clearIfActionChanged(nextActionId: string | null): void {
    const reportActionId = this.reportActionId();

    if (reportActionId && nextActionId && reportActionId !== nextActionId) {
      this.clear();
    }
  }

  clear(): void {
    this.reportRequests.next();
    this.isPreparingReport.set(false);
    this.error.set(null);
    this.reportActionId.set(null);
    this.reportId.set(null);
  }
}
