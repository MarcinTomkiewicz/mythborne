import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  StartFlowEntryDecision,
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
    this.selectedAvailability()?.heroes ?? [],
  );
  readonly showHeroSelection = computed(() => {
    return this.selectedDecision().action === 'hero_selection';
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
      activeHero: this.activeHero.loadActiveHero(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ availability }) => {
          if (token !== this.loadToken) {
            return;
          }

          this.availability.set(availability);
          this.isLoading.set(false);
        },
        error: (error: unknown) => {
          if (token !== this.loadToken) {
            return;
          }

          this.availability.set([]);
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

    if (decision.action === 'hero_selection') {
      this.blocker.set(null);
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
    const decision = this.selectedDecision();
    const heroOptions = this.selectedHeroOptions();
    const token = ++this.transitionToken;

    if (!selectedServerId) {
      this.blocker.set('Select a server before choosing a hero.');
      return;
    }

    if (decision.action !== 'hero_selection') {
      this.blocker.set(
        decision.message || 'Hero selection is not available for this server.',
      );
      return;
    }

    if (!heroOptions.some((hero) => hero.heroId === heroId)) {
      this.blocker.set('Selected hero is not available in the current start-flow state.');
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
            state.serverId !== this.activeServer.selectedServer()?.id
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

  serverAvailability(server: SelectedGameServer): StartFlowServerAvailability | null {
    return (
      this.availability().find((entry) => entry.serverId === server.id) ?? null
    );
  }
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
