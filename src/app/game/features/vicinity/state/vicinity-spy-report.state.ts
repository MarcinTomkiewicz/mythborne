import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, Observable, switchMap } from 'rxjs';
import { activeHeroContextKey } from '../../../../core/domain/hero/active-hero-context';
import {
  ActivePvpActionOffer,
  PvpSpyGameReportResult,
} from '../../../../core/domain/pvp/pvp.model';
import { pvpActiveActionErrorMessage } from '../../../../core/domain/pvp/pvp-active-action-display.mapper';
import { ActiveHero } from '../../../../core/services/hero/active-hero';
import { PlayerPvp } from '../../../../core/services/pvp/player-pvp';
import { createRequestId } from '../../../../core/utils/request-id';
import { RequestToken } from '../../../../core/utils/request-token';

const SPY_REPORT_DIAGNOSTIC_PREFIX = '[UI-PVP-7][spy-report-diagnostic]';

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
    const baseDiagnostic = this.prepareDiagnosticContext({
      offer,
      requestId,
      requestContextKey,
    });

    logSpyReportDiagnostic('prepare', baseDiagnostic);

    if (!requestContextKey) {
      this.error.set('Brak aktywnego bohatera do przygotowania raportu szpiegowania.');
      return;
    }

    this.reportActionId.set(offer.pvpActionId);
    this.reportId.set(null);
    this.isPreparingReport.set(true);
    this.error.set(null);

    if (offer.isResolved && !existingSpyResultId) {
      logSpyReportDiagnostic('contract-gap', {
        ...baseDiagnostic,
        blocker: 'resolved_spy_offer_missing_pvp_spy_result_id',
      });
      this.error.set('Szpiegowanie zakończone, ale backend nie zwrócił wyniku do raportu.');
      this.isPreparingReport.set(false);
      return;
    }

    const reportRequest = existingSpyResultId
      ? this.createReportRequest(existingSpyResultId, baseDiagnostic)
      : this.settleAndCreateReportRequest(offer, baseDiagnostic);

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
        logSpyReportDiagnostic('report-ready', {
          ...baseDiagnostic,
          reportId: report.gameReportId,
          pvpSpyResultId: report.pvpSpyResultId,
          createdNewReport: report.createdNewReport,
        });
      },
      error: (error: unknown) => {
        if (
          !this.reportRequests.isCurrent(requestId)
          || requestContextKey !== activeHeroContextKey(this.activeHero.state())
        ) {
          return;
        }

        logSpyReportDiagnostic('error', {
          ...baseDiagnostic,
          reportActionId: this.reportActionId(),
          reportId: this.reportId(),
          errorBody: serializableErrorBody(error),
        });
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

  private settleAndCreateReportRequest(
    offer: ActivePvpActionOffer,
    baseDiagnostic: SpyReportDiagnosticContext,
  ): Observable<PvpSpyGameReportResult> {
    const settleRequestId = createRequestId(`pvp-spy:settle:${offer.pvpActionId}`);

    logSpyReportDiagnostic('rpc-args', {
      ...baseDiagnostic,
      rpcName: 'settle_due_pvp_spy_action',
      args: {
        p_pvp_action_id: offer.pvpActionId,
        p_request_id: settleRequestId,
      },
    });

    return this.playerPvp.settleDueSpyAction({
      pvpActionId: offer.pvpActionId,
      requestId: settleRequestId,
    }).pipe(
      switchMap((settlement) => {
        if (!settlement.pvpSpyResultId) {
          throw new Error('missing_pvp_spy_result_id');
        }

        return this.createReportRequest(settlement.pvpSpyResultId, {
          ...baseDiagnostic,
          settlement,
        });
      }),
    );
  }

  private createReportRequest(
    pvpSpyResultId: string,
    baseDiagnostic: SpyReportDiagnosticContext,
  ): Observable<PvpSpyGameReportResult> {
    const reportRequestId = createRequestId(`pvp-spy:report:${pvpSpyResultId}`);

    logSpyReportDiagnostic('rpc-args', {
      ...baseDiagnostic,
      rpcName: 'create_pvp_spy_game_report',
      args: {
        p_pvp_spy_result_id: pvpSpyResultId,
        p_request_id: reportRequestId,
      },
    });

    return this.playerPvp.createSpyGameReport({
      pvpSpyResultId,
      requestId: reportRequestId,
    });
  }

  private prepareDiagnosticContext(input: {
    offer: ActivePvpActionOffer;
    requestId: number;
    requestContextKey: string | null;
  }): SpyReportDiagnosticContext {
    return {
      pvpActionId: input.offer.pvpActionId,
      requestId: input.requestId,
      requestContextKey: input.requestContextKey,
      activeOffer: {
        phase: input.offer.phase,
        actionKind: input.offer.actionKind,
        isResolved: input.offer.isResolved,
        pvpSpyResultId: input.offer.pvpSpyResultId,
      },
      reportActionId: this.reportActionId(),
      reportId: this.reportId(),
    };
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

interface SpyReportDiagnosticContext {
  pvpActionId: string;
  requestId: number;
  requestContextKey: string | null;
  activeOffer: {
    phase: string;
    actionKind: string;
    isResolved: boolean;
    pvpSpyResultId: string | null;
  };
  reportActionId: string | null;
  reportId: string | null;
  settlement?: unknown;
}

function logSpyReportDiagnostic(event: string, payload: unknown): void {
  console.log(
    `${SPY_REPORT_DIAGNOSTIC_PREFIX}[${event}]`,
    JSON.parse(JSON.stringify(payload)),
  );
}

function serializableErrorBody(error: unknown): unknown {
  try {
    const serialized = JSON.parse(JSON.stringify(error));

    return error instanceof Error
      ? {
          ...serialized,
          name: error.name,
          message: error.message,
        }
      : serialized;
  } catch {
    return {
      name: error instanceof Error ? error.name : null,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}
