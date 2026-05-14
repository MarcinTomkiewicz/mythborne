import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  StartFlowEntryDecision,
  AccountEntryHeroContext,
  StartFlowHeroOption,
  StartFlowServerAvailability,
} from '../../domain/start-flow/start-flow.model';
import { SelectedGameServer } from '../../interfaces/server/active-server.interface';
import { ActiveHero } from '../hero/active-hero';
import { ActiveServer } from '../server/active-server';
import { StartFlow } from './start-flow';

@Injectable()
export class StartFlowEntryState {
  private readonly activeHero = inject(ActiveHero);
  private readonly activeServer = inject(ActiveServer);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly startFlow = inject(StartFlow);
  private loadToken = 0;
  private transitionToken = 0;

  readonly availability = signal<StartFlowServerAvailability[]>([]);
  readonly accountEntryHeroContexts = signal<AccountEntryHeroContext[]>([]);
  readonly isLoading = signal(false);
  readonly isTransitioning = signal(false);
  readonly error = signal<string | null>(null);
  readonly blocker = signal<string | null>(null);
  readonly selectedServer = this.activeServer.selectedServer;
  readonly activeHeroState = this.activeHero.state;
  readonly servers = this.activeServer.servers;

  readonly visibleAvailability = computed(() =>
    this.availability().filter((entry) => entry.isVisible),
  );
  readonly selectedAvailability = computed(() => {
    const serverId = this.selectedServer()?.id ?? null;

    return serverId
      ? this.availability().find((entry) => entry.serverId === serverId) ?? null
      : null;
  });
  readonly selectedHeroOptions = computed<StartFlowHeroOption[]>(() =>
    heroOptionsForAvailability(this.selectedAvailability()),
  );
  readonly selectedDefaultHeroOption = computed<StartFlowHeroOption | null>(() => {
    const defaultHeroId = this.selectedAvailability()?.defaultHeroId ?? null;

    return defaultHeroId
      ? this.selectedHeroOptions().find((hero) => hero.heroId === defaultHeroId) ?? null
      : null;
  });
  readonly activeHeroOption = computed<StartFlowHeroOption | null>(() => {
    const activeHeroId = this.activeHeroState()?.heroId ?? null;

    return activeHeroId
      ? this.selectedHeroOptions().find((hero) => hero.heroId === activeHeroId) ?? null
      : null;
  });
  readonly canCreateSandboxHero = computed(() => {
    const availability = this.selectedAvailability();

    return !!availability?.isSandbox && availability.canCreateHero && !availability.blockReason;
  });
  readonly showHeroSelection = computed(() => {
    return this.selectedDecision().action === 'hero_selection' || this.canUseSelectedHeroSelection();
  });
  readonly selectedDecision = computed(() =>
    resolveStartFlowEntryDecision(
      this.selectedAvailability(),
      this.activeHeroState()?.heroId ?? null,
    ),
  );

  load(): void {
    const token = ++this.loadToken;

    this.isLoading.set(true);
    this.error.set(null);
    this.blocker.set(null);

    forkJoin({
      servers: this.activeServer.loadAccessibleServers(),
      availability: this.startFlow.getServerAvailability(),
      heroContexts: this.startFlow.getAccountEntryHeroContexts(),
      activeHero: this.activeHero.loadActiveHero(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ availability, heroContexts }) => {
          if (token !== this.loadToken) {
            return;
          }

          this.availability.set(availability);
          this.accountEntryHeroContexts.set(heroContexts);
          this.isLoading.set(false);
        },
        error: (error: unknown) => {
          if (token !== this.loadToken) {
            return;
          }

          this.availability.set([]);
          this.accountEntryHeroContexts.set([]);
          this.error.set(
            error instanceof Error
              ? error.message
              : 'Failed to load available game servers.',
          );
          this.isLoading.set(false);
        },
      });
  }

  selectServer(serverId: string): void {
    const token = ++this.transitionToken;
    const selected = this.activeServer.selectServer(serverId);

    if (!selected) {
      this.blocker.set('Selected server is not available for this account.');
      return;
    }

    this.isTransitioning.set(true);
    this.blocker.set(null);
    this.activeHero.clear();

    this.activeHero
      .loadActiveHero()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          if (token !== this.transitionToken) {
            return;
          }

          this.isTransitioning.set(false);
        },
        error: (error: unknown) => {
          if (token !== this.transitionToken) {
            return;
          }

          this.blocker.set(
            error instanceof Error
              ? error.message
              : 'Failed to load active hero for the selected server.',
          );
          this.isTransitioning.set(false);
        },
      });
  }

  enterSelectedServer(): void {
    const decision = this.selectedDecision();

    if (decision.action === 'blocked') {
      this.blocker.set(decision.message);
      return;
    }

    if (decision.action === 'hero_selection' || this.canUseSelectedHeroSelection()) {
      if (this.activeHeroOption()) {
        this.blocker.set(null);
        void this.router.navigateByUrl('/hero/dashboard');
        return;
      }

      const defaultHero = this.selectedDefaultHeroOption();
      if (defaultHero) {
        this.selectHero(defaultHero.heroId);
        return;
      }

      this.blocker.set('Select a sandbox hero before entering the game.');
      return;
    }

    if (!decision.route) {
      this.blocker.set('Selected server did not return an entry route.');
      return;
    }

    void this.router.navigateByUrl(decision.route);
  }

  selectHero(heroId: string): void {
    const selectedServerId = this.selectedServer()?.id ?? null;

    if (!selectedServerId) {
      this.blocker.set('Select a server before choosing a hero.');
      return;
    }

    this.enterHeroContext(selectedServerId, heroId);
  }

  enterHeroContext(serverId: string, heroId: string): void {
    const token = ++this.transitionToken;
    const availability = this.availabilityForServer(serverId);

    if (!this.canEnterHeroContext(availability)) {
      this.blocker.set(
        availability?.blockReason || 'Hero selection is not available for this server.',
      );
      return;
    }

    if (!this.canUseAccountEntryHeroContext(serverId, heroId)) {
      this.blocker.set('Selected hero is not available in the current account-entry state.');
      return;
    }

    if (this.selectedServer()?.id === serverId) {
      this.selectHeroForCurrentServer(serverId, heroId, token);
      return;
    }

    const selected = this.activeServer.selectServer(serverId);

    if (!selected) {
      this.blocker.set('Selected server is not available for this account.');
      return;
    }

    this.isTransitioning.set(true);
    this.blocker.set(null);
    this.activeHero.clear();

    this.activeHero
      .loadActiveHero()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          if (
            token !== this.transitionToken ||
            this.activeServer.selectedServer()?.id !== serverId
          ) {
            return;
          }

          this.selectHeroForCurrentServer(serverId, heroId, token);
        },
        error: (error: unknown) => {
          if (token !== this.transitionToken) {
            return;
          }

          this.blocker.set(
            error instanceof Error
              ? error.message
              : 'Failed to load active hero for the selected server.',
          );
          this.isTransitioning.set(false);
        },
      });
  }

  serverAvailability(server: SelectedGameServer): StartFlowServerAvailability | null {
    return (
      this.availability().find((entry) => entry.serverId === server.id) ?? null
    );
  }

  private canUseSelectedHeroSelection(): boolean {
    const availability = this.selectedAvailability();

    return !!availability?.isSandbox &&
      availability.canEnterGame &&
      !availability.blockReason &&
      this.selectedHeroOptions().length > 1;
  }

  private canSelectExistingHeroContext(decision: StartFlowEntryDecision): boolean {
    const availability = this.selectedAvailability();

    if (!availability?.canEnterGame || availability.blockReason) {
      return false;
    }

    return decision.action === 'hero_selection' ||
      decision.action === 'dashboard' ||
      isDashboardEntryAction(availability.nextAction) ||
      this.canUseSelectedHeroSelection();
  }

  private canEnterHeroContext(availability: StartFlowServerAvailability | null): boolean {
    if (!availability?.canEnterGame || availability.blockReason) {
      return false;
    }

    return isDashboardEntryAction(availability.nextAction) ||
      availability.nextAction === 'hero_selection' ||
      availability.nextAction === 'sandbox_hero_selection';
  }

  private canUseAccountEntryHeroContext(serverId: string, heroId: string): boolean {
    return this.accountEntryHeroContexts().some((context) =>
      context.serverId === serverId &&
      context.heroId === heroId &&
      context.routeNextAction === 'hero_dashboard',
    );
  }

  private availabilityForServer(serverId: string): StartFlowServerAvailability | null {
    return this.availability().find((entry) => entry.serverId === serverId) ?? null;
  }

  private selectHeroForCurrentServer(
    serverId: string,
    heroId: string,
    token: number,
  ): void {
    const decision = this.selectedDecision();

    if (
      this.selectedServer()?.id !== serverId ||
      !this.canSelectExistingHeroContext(decision)
    ) {
      this.blocker.set(
        decision.message || 'Hero selection is not available for this server.',
      );
      this.isTransitioning.set(false);
      return;
    }

    this.isTransitioning.set(true);
    this.blocker.set(null);

    this.activeHero
      .selectHero(heroId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (state) => {
          if (
            token !== this.transitionToken ||
            state.serverId !== serverId ||
            this.activeServer.selectedServer()?.id !== serverId
          ) {
            return;
          }

          this.isTransitioning.set(false);
          void this.router.navigateByUrl('/hero/dashboard');
        },
        error: (error: unknown) => {
          if (token !== this.transitionToken) {
            return;
          }

          this.blocker.set(
            error instanceof Error
              ? error.message
              : 'Failed to select hero for this server.',
          );
          this.isTransitioning.set(false);
        },
      });
  }
}

export function heroOptionsForAvailability(
  availability: StartFlowServerAvailability | null,
): StartFlowHeroOption[] {
  if (!availability) {
    return [];
  }

  if (availability.heroes.length > 0) {
    return availability.heroes;
  }

  if (availability.defaultHeroId && availability.defaultHeroName) {
    return [{
      heroId: availability.defaultHeroId,
      heroName: availability.defaultHeroName,
      createdAt: null,
    }];
  }

  return [];
}

export function resolveStartFlowEntryDecision(
  availability: StartFlowServerAvailability | null,
  activeHeroId: string | null,
): StartFlowEntryDecision {
  if (!availability) {
    return {
      action: 'blocked',
      route: null,
      message: 'Select a server before entering the game.',
    };
  }

  switch (availability.nextAction) {
    case 'dashboard':
    case 'game_shell':
    case 'enter_game':
      if (activeHeroId && availability.canEnterGame && !availability.blockReason) {
        return {
          action: 'dashboard',
          route: '/hero/dashboard',
          message: null,
        };
      }
      if (availability.canEnterGame && !activeHeroId) {
        return {
          action: 'blocked',
          route: null,
          message: 'Active hero context must be loaded before entering the game.',
        };
      }
      break;
    case 'create_hero':
      if (availability.canCreateHero) {
        return {
          action: 'create_hero',
          route: '/auth/create-character',
          message: null,
        };
      }
      break;
    case 'hero_selection':
    case 'sandbox_hero_selection':
      if (availability.canEnterGame && !availability.blockReason) {
        return {
          action: 'hero_selection',
          route: null,
          message: null,
        };
      }
      break;
    case 'blocked':
      break;
    default:
      return {
        action: 'blocked',
        route: null,
        message: `Unsupported start-flow entry action returned by DB: ${availability.nextAction || 'empty'}.`,
      };
  }

  return {
    action: 'blocked',
    route: null,
    message:
      availability.blockReason ||
      'This server is not available for character creation.',
  };
}

function isDashboardEntryAction(action: string): boolean {
  return action === 'dashboard' ||
    action === 'game_shell' ||
    action === 'enter_game';
}
