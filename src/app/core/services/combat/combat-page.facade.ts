import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { CombatDisplayDictionaries } from '../../domain/combat/combat-dictionary.model';
import { CombatAttackEvent } from '../../domain/combat/combat.model';
import {
  CombatBalanceRules,
  CombatRoundEntry,
  CombatantSnapshot,
  SandboxCombatResult,
} from '../../domain/combat/combat-sandbox.model';
import { OriginBonus, Origin } from '../../domain/origin/origin.model';
import { IStat } from '../../interfaces/i-stats/i-stats';
import {
  toWalkingDeadSpeed,
  toWalkingDeadZone,
} from '../../utils/combat-walking-dead';
import {
  combatSandboxOutcomeLabel,
  combatSandboxSourceTypeLabel,
  combatSandboxWinnerSideLabel,
  withCombatSandboxAttackSourceKindLabels,
} from '../../utils/combat-sandbox-display';
import { getErrorMessage } from '../../utils/error-message';
import { CombatBalanceService } from './combat-balance';
import { CombatPageLoaderService } from './combat-page-loader';
import { CombatSandboxCallerService } from './combat-sandbox-caller';

type CombatPhase = 'idle' | 'player_turn' | 'finished';

@Injectable()
export class CombatPageFacade {
  private readonly destroyRef = inject(DestroyRef);
  private readonly balance = inject(CombatBalanceService);
  private readonly loader = inject(CombatPageLoaderService);
  private readonly sandboxCaller = inject(CombatSandboxCallerService);
  private walkingTimer: number | null = null;

  readonly isLoading = signal(false);
  readonly isResolving = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly battleError = signal<string | null>(null);
  readonly heroId = signal<string | null>(null);
  readonly hero = signal<CombatantSnapshot | null>(null);
  readonly enemy = signal<CombatantSnapshot | null>(null);
  readonly result = signal<SandboxCombatResult | null>(null);
  readonly combatDictionaries = signal<CombatDisplayDictionaries | null>(null);
  readonly origin = signal<Origin | null>(null);
  readonly originBonuses = signal<OriginBonus[]>([]);
  readonly statsDefinitions = signal<IStat[]>([]);
  readonly rules = signal<CombatBalanceRules | null>(null);
  readonly phase = signal<CombatPhase>('idle');
  readonly turn = signal(1);
  readonly streak = signal(0);
  readonly heroCurrentHealth = signal(0);
  readonly enemyCurrentHealth = signal(0);
  readonly logEntries = signal<CombatRoundEntry[]>([]);
  readonly attacks = signal<readonly CombatAttackEvent[]>([]);
  readonly walkingPosition = signal(0);
  readonly walkingDirection = signal<1 | -1>(1);
  readonly turnLimit = signal<number | null>(null);

  readonly winnerLabel = computed(() => {
    const result = this.result();

    if (!result?.winnerKey) {
      return null;
    }

    return result.winnerKey === this.hero()?.key ? this.hero()?.name : this.enemy()?.name;
  });
  readonly canStartFight = computed(
    () =>
      !!this.hero() &&
      !!this.enemy() &&
      !!this.rules() &&
      !!this.heroId() &&
      !this.isLoading() &&
      !this.isResolving()
  );
  readonly canStrike = computed(
    () => this.phase() === 'player_turn' && !this.result() && !this.isResolving()
  );
  readonly playerHitWindow = computed(() => {
    const hero = this.hero();
    const enemy = this.enemy();
    const rules = this.rules();

    if (!hero || !enemy || !rules) {
      return toWalkingDeadZone(20, 0);
    }

    try {
      return toWalkingDeadZone(
        this.balance.evaluateHitWindow(rules, hero, enemy),
        this.streak()
      );
    } catch {
      return toWalkingDeadZone(20, 0);
    }
  });
  readonly walkingSpeed = computed(() => toWalkingDeadSpeed(this.streak()));
  readonly turnLabel = computed(() =>
    this.turnLimit() ? `${this.turn()} / ${this.turnLimit()}` : `${this.turn()}`
  );
  readonly outcomeLabel = computed(() =>
    combatSandboxOutcomeLabel(this.result(), this.combatDictionaries())
  );
  readonly sourceTypeLabel = computed(() =>
    combatSandboxSourceTypeLabel(this.combatDictionaries())
  );
  readonly winnerSideLabel = computed(() =>
    combatSandboxWinnerSideLabel(this.result(), this.combatDictionaries())
  );

  constructor() {
    this.destroyRef.onDestroy(() => this.stopWalkingDead());
  }

  loadData() {
    this.isLoading.set(true);
    this.loadError.set(null);

    this.loader.load()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (data) => {
          this.heroId.set(data.heroId);
          this.origin.set(data.origin);
          this.originBonuses.set(data.originBonuses);
          this.statsDefinitions.set(data.statsDefinitions);
          this.rules.set(data.rules);
          this.combatDictionaries.set(data.dictionaries);
          this.hero.set(data.hero);
          this.enemy.set(data.enemy);
          this.resetCombatState();
        },
        error: (error: unknown) => {
          this.loadError.set(getErrorMessage(error, 'Failed to load combat data.'));
        },
      });
  }

  startFight() {
    if (!this.canStartFight()) {
      return;
    }

    this.resetCombatState();
    this.phase.set('player_turn');
    this.startWalkingDead();
  }

  strike() {
    const hero = this.hero();
    const enemy = this.enemy();
    const heroId = this.heroId();

    if (!hero || !enemy || !heroId || !this.canStrike()) {
      return;
    }

    this.battleError.set(null);
    this.stopWalkingDead();
    this.isResolving.set(true);

    this.sandboxCaller.resolvePlayerStep({
      heroId,
      hero,
      enemy,
      heroHealth: this.heroCurrentHealth(),
      enemyHealth: this.enemyCurrentHealth(),
      turnNumber: this.turn(),
      attackOrderStart: this.logEntries().length + 1,
      indicatorPosition: this.walkingPosition(),
      streak: this.streak(),
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isResolving.set(false)),
      )
      .subscribe({
        next: ({ result, logEntries, attacks, heroHealth, enemyHealth, turnsPlayed, turnLimit }) => {
          this.turnLimit.set(turnLimit);
          this.attacks.update((entries) => [...entries, ...attacks]);
          this.logEntries.update((entries) => [
            ...entries,
            ...withCombatSandboxAttackSourceKindLabels(
              logEntries,
              attacks,
              this.combatDictionaries(),
            ),
          ]);
          this.heroCurrentHealth.set(heroHealth);
          this.enemyCurrentHealth.set(enemyHealth);
          this.streak.set(logEntries[0]?.result === 'miss' ? 0 : this.streak() + 1);
          this.turn.set(turnsPlayed);

          if (result) {
            this.result.set(result);
            this.phase.set('finished');
            return;
          }

          this.turn.update((turn) => turn + 1);
          this.phase.set('player_turn');
          this.startWalkingDead();
        },
        error: (error: unknown) => {
          this.battleError.set(getErrorMessage(error, 'Failed to resolve combat.'));
          this.phase.set('idle');
        },
      });
  }

  baseStatEntries(combatant: CombatantSnapshot): Array<{ key: string; label: string; value: number }> {
    const labels = Object.fromEntries(
      this.statsDefinitions().map((definition) => [definition.key, definition.label])
    );

    return Object.entries(combatant.baseStats).map(([key, value]) => ({
      key,
      label: labels[key] ?? key,
      value,
    }));
  }

  maxHealth(combatant: CombatantSnapshot | null): number {
    return combatant?.derived.health ?? 0;
  }

  currentHealth(combatant: CombatantSnapshot | null): number {
    if (!combatant) {
      return 0;
    }

    return combatant.key === 'hero' ? this.heroCurrentHealth() : this.enemyCurrentHealth();
  }

  trackLogEntry(index: number, entry: CombatRoundEntry) {
    return `${index}:${entry.turn}:${entry.attackerKey}:${entry.defenderKey}:${entry.result}`;
  }

  private resetCombatState() {
    this.stopWalkingDead();
    this.result.set(null);
    this.battleError.set(null);
    this.phase.set('idle');
    this.turn.set(1);
    this.streak.set(0);
    this.logEntries.set([]);
    this.attacks.set([]);
    this.walkingPosition.set(0);
    this.walkingDirection.set(1);
    this.heroCurrentHealth.set(this.hero()?.derived.health ?? 0);
    this.enemyCurrentHealth.set(this.enemy()?.derived.health ?? 0);
  }

  private startWalkingDead() {
    this.stopWalkingDead();
    this.walkingPosition.set(0);
    this.walkingDirection.set(1);
    const step = this.walkingSpeed();

    this.walkingTimer = window.setInterval(() => {
      const next = this.walkingPosition() + this.walkingDirection() * step;

      if (next >= 100) {
        this.walkingPosition.set(100);
        this.walkingDirection.set(-1);
        return;
      }

      if (next <= 0) {
        this.walkingPosition.set(0);
        this.walkingDirection.set(1);
        return;
      }

      this.walkingPosition.set(Number(next.toFixed(2)));
    }, 16);
  }

  private stopWalkingDead() {
    if (this.walkingTimer !== null) {
      window.clearInterval(this.walkingTimer);
      this.walkingTimer = null;
    }
  }

}
