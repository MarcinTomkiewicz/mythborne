import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, Observable } from 'rxjs';
import {
  PVP_SANDBOX_ADD_ATTACKS_ERROR,
  PVP_SANDBOX_ADD_ATTACKS_REASON,
  PVP_SANDBOX_ADD_ATTACKS_SUCCESS_PREFIX,
  PVP_SANDBOX_ATTACK_AMOUNT,
  PVP_SANDBOX_SKIP_ERROR,
  PVP_SANDBOX_SKIP_SUCCESS,
  PVP_SANDBOX_TITLE,
  PVP_SANDBOX_UNAVAILABLE,
} from '../../../../core/configs/pvp-active-action-ui.config';
import { ActivePvpActionOffer } from '../../../../core/domain/pvp/pvp.model';
import { ActiveHero } from '../../../../core/services/hero/active-hero';
import { PlayerPvpDebug } from '../../../../core/services/pvp/player-pvp-debug';
import { ActiveServer } from '../../../../core/services/server/active-server';
import { ToastService } from '../../../../core/services/ui/toast';
import { getErrorMessage } from '../../../../core/utils/error-message';
import { createRequestId } from '../../../../core/utils/request-id';
import { RequestToken } from '../../../../core/utils/request-token';
import { canShowSandboxTestTools } from '../../../../core/utils/sandbox-test-tools-visibility';

@Injectable()
export class PvpSandboxToolState {
  private readonly activeHero = inject(ActiveHero);
  private readonly activeServer = inject(ActiveServer);
  private readonly debug = inject(PlayerPvpDebug);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toast = inject(ToastService);
  private readonly sandboxActionToken = new RequestToken();

  readonly isRunningSandboxTool = signal(false);
  readonly feedback = signal<string | null>(null);
  readonly canShowSandboxTools = computed(() => {
    const server = this.activeServer.selectedServer();
    const access = this.activeServer.access();

    return canShowSandboxTestTools(server, access);
  });
  readonly canAddSandboxAttacks = computed(() =>
    this.canShowSandboxTools()
    && Boolean(this.currentHeroId())
    && !this.isRunningSandboxTool(),
  );

  canSkipSandboxAttackTravel(offer: ActivePvpActionOffer | null): boolean {
    return this.canShowSandboxTools()
      && !this.isRunningSandboxTool()
      && this.isActiveAttackTravelOffer(offer);
  }

  skipSandboxAttackTravel(
    offer: ActivePvpActionOffer | null,
    onSuccess: () => void,
  ): void {
    if (!this.canSkipSandboxAttackTravel(offer)) {
      this.feedback.set(PVP_SANDBOX_UNAVAILABLE);
      return;
    }

    this.runSandboxAction(
      this.debug.skipActiveAttackTravelTimer({
        requestId: createRequestId('pvp-sandbox-skip-attack-travel'),
      }),
      () => {
        onSuccess();
        this.toast.show('success', PVP_SANDBOX_TITLE, PVP_SANDBOX_SKIP_SUCCESS);
      },
      PVP_SANDBOX_SKIP_ERROR,
    );
  }

  addSandboxAttacks(onSuccess: () => void): void {
    const serverId = this.currentServerId();
    const heroId = this.currentHeroId();

    if (!serverId || !heroId || !this.canShowSandboxTools()) {
      this.feedback.set(PVP_SANDBOX_UNAVAILABLE);
      return;
    }

    this.runSandboxAction(
      this.debug.addRemainingAttacks({
        serverId,
        heroId,
        amount: PVP_SANDBOX_ATTACK_AMOUNT,
        reason: PVP_SANDBOX_ADD_ATTACKS_REASON,
      }),
      (result) => {
        onSuccess();
        this.toast.show(
          'success',
          PVP_SANDBOX_TITLE,
          `${PVP_SANDBOX_ADD_ATTACKS_SUCCESS_PREFIX} ${result.remainingCount}.`,
        );
      },
      PVP_SANDBOX_ADD_ATTACKS_ERROR,
    );
  }

  private runSandboxAction<T>(
    action: Observable<T>,
    onSuccess: (result: T) => void,
    errorMessage: string,
  ): void {
    const token = this.sandboxActionToken.next();

    this.isRunningSandboxTool.set(true);
    this.feedback.set(null);
    action
      .pipe(
        finalize(() => {
          if (this.sandboxActionToken.isCurrent(token)) {
            this.isRunningSandboxTool.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (result) => {
          if (!this.isCurrentSandboxAction(token)) {
            return;
          }

          onSuccess(result);
        },
        error: (error: unknown) => {
          if (!this.isCurrentSandboxAction(token)) {
            return;
          }

          this.feedback.set(getErrorMessage(error, errorMessage));
        },
      });
  }

  private isCurrentSandboxAction(token: number): boolean {
    return this.sandboxActionToken.isCurrent(token) && this.canShowSandboxTools();
  }

  private isActiveAttackTravelOffer(offer: ActivePvpActionOffer | null): boolean {
    return offer?.actionKind === 'attack' &&
      offer.isTravelPhase &&
      !offer.isManualWindow &&
      !offer.canEnterManualResolution &&
      offer.phase !== 'manual_window' &&
      offer.phase !== 'live_combat' &&
      !offer.combatLiveSessionId &&
      !offer.isResolved;
  }

  private currentServerId(): string | null {
    return this.activeServer.selectedServer()?.id ?? this.activeHero.state()?.serverId ?? null;
  }

  private currentHeroId(): string | null {
    return this.activeHero.state()?.heroId ?? null;
  }
}
