import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, Observable, switchMap } from 'rxjs';
import { activeHeroContextKey } from '../../../../core/domain/hero/active-hero-context';
import {
  ActivePvpActionOffer,
  PvpSpyGameReportResult,
} from '../../../../core/domain/pvp/pvp.model';
import { ActiveHero } from '../../../../core/services/hero/active-hero';
import { PlayerPvp } from '../../../../core/services/pvp/player-pvp';
import { getErrorMessage } from '../../../../core/utils/error-message';
import { createRequestId } from '../../../../core/utils/request-id';
import { RequestToken } from '../../../../core/utils/request-token';

@Injectable()
export class PvpSpyReportState {
  private readonly activeHero = inject(ActiveHero);
  private readonly destroyRef = inject(DestroyRef);
  private readonly playerPvp = inject(PlayerPvp);
  private readonly reportRequests = new RequestToken();
  private readonly reportActionId = signal<string | null>(null);
  private readonly genericErrorLabel = signal('');

  readonly isPreparingReport = signal(false);
  readonly error = signal<string | null>(null);
  readonly reportId = signal<string | null>(null);

  setGenericErrorLabel(label: string | null): void {
    this.genericErrorLabel.set(label ?? '');
  }

  prepare(offer: ActivePvpActionOffer): void {
    const existingSpyResultId = offer.pvpSpyResultId;

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
      this.error.set(this.genericErrorLabel());
      return;
    }

    this.reportActionId.set(offer.pvpActionId);
    this.reportId.set(null);
    this.isPreparingReport.set(true);
    this.error.set(null);

    if (offer.isResolved && !existingSpyResultId) {
      this.error.set(this.genericErrorLabel());
      this.isPreparingReport.set(false);
      return;
    }

    const reportRequest = existingSpyResultId
      ? this.createReportRequest(existingSpyResultId)
      : this.settleAndCreateReportRequest(offer);

    reportRequest.pipe(
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
            ? this.genericErrorLabel()
            : getErrorMessage(error, this.genericErrorLabel()),
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

  private settleAndCreateReportRequest(
    offer: ActivePvpActionOffer,
  ): Observable<PvpSpyGameReportResult> {
    const settleRequestId = createRequestId(`pvp-spy:settle:${offer.pvpActionId}`);

    return this.playerPvp.settleDueSpyAction({
      pvpActionId: offer.pvpActionId,
      requestId: settleRequestId,
    }).pipe(
      switchMap((settlement) => {
        if (!settlement.pvpSpyResultId) {
          throw new Error('missing_pvp_spy_result_id');
        }

        return this.createReportRequest(settlement.pvpSpyResultId);
      }),
    );
  }

  private createReportRequest(
    pvpSpyResultId: string,
  ): Observable<PvpSpyGameReportResult> {
    const reportRequestId = createRequestId(`pvp-spy:report:${pvpSpyResultId}`);

    return this.playerPvp.createSpyGameReport({
      pvpSpyResultId,
      requestId: reportRequestId,
    });
  }
}
