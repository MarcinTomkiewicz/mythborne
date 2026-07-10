import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, switchMap, throwError } from 'rxjs';
import {
  MANUAL_TRIAL_ERROR_CODES,
  MANUAL_TRIAL_ERROR_CONTEXT,
} from '../../constants/manual-trial.const';
import { RPC } from '../../constants/rpc.const';
import { ensureCurrentHeroServerScopedResult } from '../../domain/hero/hero-server-scope.guard';
import {
  mapManualRuntimeManifest,
  mapManualTrialBackendVerdict,
  mapManualTrialReportHandoff,
  mapTrialOffer,
  toSubmitActionLogRpcArgs,
} from '../../domain/manual-trial/manual-trial-core.mapper';
import {
  ManualRuntimeManifest,
  ManualTrialActionLogEnvelope,
  ManualTrialActionLogSubmitEnvelope,
  ManualTrialBackendVerdict,
  ManualTrialReportHandoff,
  TrialOffer,
} from '../../domain/manual-trial/manual-trial-core.model';
import {
  HeroServerScope,
  MatchingIdGuard,
} from '../../interfaces/hero/hero-server-scope.interface';
import {
  ActiveOfferRpcArgs,
  ActiveOfferRpcRow,
  AttemptVerdictRpcArgs,
  AttemptVerdictRpcRow,
  AutoResolveAttemptRpcArgs,
  AutoResolveAttemptRpcRow,
  CreateReportHandoffRpcArgs,
  CreateReportHandoffRpcRow,
  ExitManualTrialRpcArgs,
  ExitManualTrialRpcRow,
  RuntimeManifestRpcArgs,
  RuntimeManifestRpcRow,
  SessionVerdictRpcArgs,
  SessionVerdictRpcRow,
  StartSessionRpcArgs,
  StartSessionRpcRow,
  SubmitActionLogRpcRow,
} from '../../types/manual-trial-rpc.types';
import { requiredTrimmedText } from '../../utils/normalize-text';
import { normalizeOrCreateRequestId } from '../../utils/request-id';
import {
  mapOptionalRpcResultRow,
  mapRequiredRpcResultRow,
} from '../../utils/rpc-result';
import { Backend } from '../backend/backend';
import { ActiveHero } from '../hero/active-hero';
import { ActiveServer } from '../server/active-server';

@Injectable({ providedIn: 'root' })
export class ManualTrialFlow {
  private readonly activeHero = inject(ActiveHero);
  private readonly activeServer = inject(ActiveServer);
  private readonly backend = inject(Backend);

  getActiveOffer(): Observable<TrialOffer | null> {
    return this.runScopedCall((heroId) => {
      const args: ActiveOfferRpcArgs = {
        p_hero_id: heroId,
      };

      return this.backend
        .rpc<ActiveOfferRpcRow[]>(RPC.get_active_trial_offer, args)
        .pipe(mapOptionalRpcResultRow(RPC.get_active_trial_offer, mapTrialOffer));
    });
  }

  startRuntimeSession(
    rawAttemptId: string,
    rawRequestId?: string | null,
  ): Observable<ManualRuntimeManifest> {
    const attemptId = requiredTrimmedText(
      rawAttemptId,
      'attemptId',
      MANUAL_TRIAL_ERROR_CONTEXT,
    );
    const requestId = normalizeOrCreateRequestId(
      rawRequestId,
      `manual-trial:start:${attemptId}`,
    );
    const args: StartSessionRpcArgs = {
      p_attempt_id: attemptId,
      p_request_id: requestId,
    };

    return this.runScopedCall(
      () =>
        this.backend
          .rpc<StartSessionRpcRow[]>(RPC.start_manual_trial_runtime_session, args)
          .pipe(
            mapRequiredRpcResultRow(
              RPC.start_manual_trial_runtime_session,
              mapManualRuntimeManifest,
            ),
          ),
      (manifest) => [
        {
          actual: manifest.attemptId,
          expected: attemptId,
          errorCode: MANUAL_TRIAL_ERROR_CODES.staleAttempt,
        },
      ],
    );
  }

  getRuntimeManifest(
    rawManualSessionId: string,
  ): Observable<ManualRuntimeManifest | null> {
    const manualSessionId = requiredTrimmedText(
      rawManualSessionId,
      'manualSessionId',
      MANUAL_TRIAL_ERROR_CONTEXT,
    );
    const args: RuntimeManifestRpcArgs = {
      p_manual_session_id: manualSessionId,
    };

    return this.runScopedCall(
      () =>
        this.backend
          .rpc<RuntimeManifestRpcRow[]>(RPC.get_manual_trial_runtime_manifest, args)
          .pipe(
            mapOptionalRpcResultRow(
              RPC.get_manual_trial_runtime_manifest,
              mapManualRuntimeManifest,
            ),
          ),
      (manifest) =>
        manifest
          ? [
              {
                actual: manifest.manualSessionId,
                expected: manualSessionId,
                errorCode: MANUAL_TRIAL_ERROR_CODES.staleSession,
              },
            ]
          : [],
    );
  }

  submitActionLog(
    envelope: ManualTrialActionLogEnvelope,
  ): Observable<ManualTrialBackendVerdict> {
    const attemptId = requiredTrimmedText(
      envelope.attemptId,
      'attemptId',
      MANUAL_TRIAL_ERROR_CONTEXT,
    );
    const manualSessionId = requiredTrimmedText(
      envelope.manualSessionId,
      'manualSessionId',
      MANUAL_TRIAL_ERROR_CONTEXT,
    );
    const manifestId = requiredTrimmedText(
      envelope.manifestId,
      'manifestId',
      MANUAL_TRIAL_ERROR_CONTEXT,
    );
    const manifestHash = requiredTrimmedText(
      envelope.manifestHash,
      'manifestHash',
      MANUAL_TRIAL_ERROR_CONTEXT,
    );
    const normalizedEnvelope: ManualTrialActionLogSubmitEnvelope = {
      ...envelope,
      requestId: normalizeOrCreateRequestId(
        envelope.requestId,
        `manual-trial:action-log:${manualSessionId}`,
      ),
      attemptId,
      manualSessionId,
      manifestId,
      manifestHash,
    };

    return this.runScopedCall(
      () =>
        this.backend
          .rpc<SubmitActionLogRpcRow[]>(
            RPC.submit_manual_trial_action_log,
            toSubmitActionLogRpcArgs(normalizedEnvelope),
          )
          .pipe(
            mapRequiredRpcResultRow(
              RPC.submit_manual_trial_action_log,
              mapManualTrialBackendVerdict,
            ),
          ),
      (verdict) => [
        {
          actual: verdict.attemptId,
          expected: attemptId,
          errorCode: MANUAL_TRIAL_ERROR_CODES.staleAttempt,
        },
        {
          actual: verdict.manualSessionId,
          expected: manualSessionId,
          errorCode: MANUAL_TRIAL_ERROR_CODES.staleSession,
        },
      ],
    );
  }

  getSessionVerdict(
    rawManualSessionId: string,
  ): Observable<ManualTrialBackendVerdict | null> {
    const manualSessionId = requiredTrimmedText(
      rawManualSessionId,
      'manualSessionId',
      MANUAL_TRIAL_ERROR_CONTEXT,
    );
    const args: SessionVerdictRpcArgs = {
      p_manual_session_id: manualSessionId,
    };

    return this.runScopedCall(
      () =>
        this.backend
          .rpc<SessionVerdictRpcRow[]>(RPC.get_manual_trial_backend_verdict, args)
          .pipe(
            mapOptionalRpcResultRow(
              RPC.get_manual_trial_backend_verdict,
              mapManualTrialBackendVerdict,
            ),
          ),
      (verdict) =>
        verdict
          ? [
              {
                actual: verdict.manualSessionId,
                expected: manualSessionId,
                errorCode: MANUAL_TRIAL_ERROR_CODES.staleSession,
              },
            ]
          : [],
    );
  }

  getAttemptVerdict(
    rawAttemptId: string,
  ): Observable<ManualTrialBackendVerdict | null> {
    const attemptId = requiredTrimmedText(
      rawAttemptId,
      'attemptId',
      MANUAL_TRIAL_ERROR_CONTEXT,
    );
    const args: AttemptVerdictRpcArgs = {
      p_attempt_id: attemptId,
    };

    return this.runScopedCall(
      () =>
        this.backend
          .rpc<AttemptVerdictRpcRow[]>(
            RPC.get_manual_trial_backend_verdict_for_attempt,
            args,
          )
          .pipe(
            mapOptionalRpcResultRow(
              RPC.get_manual_trial_backend_verdict_for_attempt,
              mapManualTrialBackendVerdict,
            ),
          ),
      (verdict) =>
        verdict
          ? [
              {
                actual: verdict.attemptId,
                expected: attemptId,
                errorCode: MANUAL_TRIAL_ERROR_CODES.staleAttempt,
              },
            ]
          : [],
    );
  }

  autoResolveAttempt(
    rawAttemptId: string,
    rawRequestId?: string | null,
  ): Observable<ManualTrialBackendVerdict> {
    const attemptId = requiredTrimmedText(
      rawAttemptId,
      'attemptId',
      MANUAL_TRIAL_ERROR_CONTEXT,
    );
    const requestId = normalizeOrCreateRequestId(
      rawRequestId,
      `manual-trial:auto:${attemptId}`,
    );
    const args: AutoResolveAttemptRpcArgs = {
      p_attempt_id: attemptId,
      p_request_id: requestId,
    };

    return this.runScopedCall(
      () =>
        this.backend
          .rpc<AutoResolveAttemptRpcRow[]>(RPC.auto_resolve_manual_trial, args)
          .pipe(
            mapRequiredRpcResultRow(
              RPC.auto_resolve_manual_trial,
              mapManualTrialBackendVerdict,
            ),
          ),
      (verdict) => [
        {
          actual: verdict.attemptId,
          expected: attemptId,
          errorCode: MANUAL_TRIAL_ERROR_CODES.staleAttempt,
        },
      ],
    );
  }

  exitToAutoResolve(
    rawManualSessionId: string,
    rawRequestId?: string | null,
  ): Observable<ManualTrialBackendVerdict> {
    const manualSessionId = requiredTrimmedText(
      rawManualSessionId,
      'manualSessionId',
      MANUAL_TRIAL_ERROR_CONTEXT,
    );
    const requestId = normalizeOrCreateRequestId(
      rawRequestId,
      `manual-trial:exit:${manualSessionId}`,
    );
    const args: ExitManualTrialRpcArgs = {
      p_manual_session_id: manualSessionId,
      p_request_id: requestId,
    };

    return this.runScopedCall(
      () =>
        this.backend
          .rpc<ExitManualTrialRpcRow[]>(
            RPC.exit_manual_trial_to_auto_resolve,
            args,
          )
          .pipe(
            mapRequiredRpcResultRow(
              RPC.exit_manual_trial_to_auto_resolve,
              mapManualTrialBackendVerdict,
            ),
          ),
      (verdict) => [
        {
          actual: verdict.manualSessionId,
          expected: manualSessionId,
          errorCode: MANUAL_TRIAL_ERROR_CODES.staleSession,
        },
      ],
    );
  }

  createReportHandoff(
    rawVerdictId: string,
    rawRequestId?: string | null,
  ): Observable<ManualTrialReportHandoff> {
    const verdictId = requiredTrimmedText(
      rawVerdictId,
      'verdictId',
      MANUAL_TRIAL_ERROR_CONTEXT,
    );
    const requestId = normalizeOrCreateRequestId(
      rawRequestId,
      `manual-trial:report:${verdictId}`,
    );
    const args: CreateReportHandoffRpcArgs = {
      p_verdict_id: verdictId,
      p_request_id: requestId,
    };

    return this.runScopedCall(
      () =>
        this.backend
          .rpc<CreateReportHandoffRpcRow[]>(
            RPC.create_manual_trial_game_report,
            args,
          )
          .pipe(
            mapRequiredRpcResultRow(
              RPC.create_manual_trial_game_report,
              mapManualTrialReportHandoff,
            ),
          ),
      (handoff) => [
        {
          actual: handoff.verdictId,
          expected: verdictId,
          errorCode: MANUAL_TRIAL_ERROR_CODES.staleVerdict,
        },
      ],
    );
  }

  private runScopedCall<T extends HeroServerScope | null>(
    call: (heroId: string) => Observable<T>,
    matchingIds: (result: T) => readonly MatchingIdGuard[] = () => [],
  ): Observable<T> {
    return this.activeHero
      .requireActiveHero()
      .pipe(
        switchMap((context) =>
          call(context.heroId).pipe(
            map((result) =>
              ensureCurrentHeroServerScopedResult(
                this.activeHero.state(),
                this.activeServer.selectedServer()?.id ?? null,
                context,
                result,
                MANUAL_TRIAL_ERROR_CODES,
                matchingIds(result),
              ),
            ),
            catchError((error: unknown) => {
              ensureCurrentHeroServerScopedResult(
                this.activeHero.state(),
                this.activeServer.selectedServer()?.id ?? null,
                context,
                null,
                MANUAL_TRIAL_ERROR_CODES,
              );

              return throwError(() => error);
            }),
          ),
        ),
      );
  }

}
