import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, finalize, forkJoin, map, of, switchMap } from 'rxjs';
import { BonusSource } from '../../domain/bonus/bonus.model';
import {
  CombatBalanceRules,
  CombatOutcome,
  CombatRoundEntry,
  CombatantSnapshot,
  CombatResult,
} from '../../domain/combat/combat.model';
import { OriginBonus, Origin } from '../../domain/origin/origin.model';
import { IHeroDerived } from '../../types/hero.types';
import { IHeroStats } from '../../interfaces/hero/i-hero-stats';
import { IStat } from '../../interfaces/i-stats/i-stats';
import {
  COMBAT_TURN_LIMIT,
  toWalkingDeadSpeed,
  toWalkingDeadZone,
} from '../../utils/combat-walking-dead';
import { getErrorMessage } from '../../utils/error-message';
import { Hero } from '../hero/hero';
import { HeroDerivedStats } from '../hero/hero-derived-stats';
import { Origins } from '../origins/origins';
import { StatsService } from '../stats/stats';
import { CombatBalanceService } from './combat-balance';
import { CombatDemoFactoryService } from './combat-demo-factory';
import { CombatResolverService } from './combat-resolver';

type CombatPhase = 'idle' | 'player_turn' | 'finished';

@Injectable()
export class CombatPageFacade {
  private readonly destroyRef = inject(DestroyRef);
  private readonly heroService = inject(Hero);
  private readonly heroDerivedStats = inject(HeroDerivedStats);
  private readonly originsService = inject(Origins);
  private readonly statsService = inject(StatsService);
  private readonly balance = inject(CombatBalanceService);
  private readonly demoFactory = inject(CombatDemoFactoryService);
  private readonly resolver = inject(CombatResolverService);
  private walkingTimer: number | null = null;

  readonly isLoading = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly battleError = signal<string | null>(null);
  readonly hero = signal<CombatantSnapshot | null>(null);
  readonly enemy = signal<CombatantSnapshot | null>(null);
  readonly result = signal<CombatResult | null>(null);
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
  readonly walkingPosition = signal(0);
  readonly walkingDirection = signal<1 | -1>(1);

  readonly winnerLabel = computed(() => {
    const result = this.result();

    if (!result?.winnerKey) {
      return null;
    }

    return result.winnerKey === this.hero()?.key ? this.hero()?.name : this.enemy()?.name;
  });
  readonly canStartFight = computed(
    () => !!this.hero() && !!this.enemy() && !!this.rules() && !this.isLoading()
  );
  readonly canStrike = computed(() => this.phase() === 'player_turn' && !this.result());
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
  readonly turnLabel = computed(() => `${this.turn()} / ${COMBAT_TURN_LIMIT}`);
  readonly outcomeLabel = computed(() => {
    const outcome = this.result()?.outcome;

    switch (outcome) {
      case 'victory':
        return 'Victory';
      case 'defeat':
        return 'Defeat';
      case 'draw':
        return 'Draw';
      default:
        return null;
    }
  });

  constructor() {
    this.destroyRef.onDestroy(() => this.stopWalkingDead());
  }

  loadData() {
    this.isLoading.set(true);
    this.loadError.set(null);

    forkJoin({
      hero: this.heroService.getHeroData(),
      baseStats: this.heroService.getHeroStats(),
      statsDefinitions: this.statsService.getStats(),
      rules: this.balance.getRules(),
    })
      .pipe(
        switchMap(({ hero, baseStats, statsDefinitions, rules }) => {
          const originRequest$: Observable<{
            origin: Origin | null;
            bonuses: OriginBonus[];
          }> = hero.origin_id
            ? this.originsService.getOriginWithBonuses(hero.origin_id)
            : of({ origin: null, bonuses: [] });

          return originRequest$.pipe(
            switchMap(({ origin, bonuses }) =>
              this.heroDerivedStats.resolveActiveHeroDerivedStats('combat').pipe(
                map((derivedStats) => ({
                  hero,
                  baseStats,
                  derivedStats,
                  statsDefinitions,
                  rules,
                  origin,
                  bonuses,
                })),
              ),
            ),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: ({ hero, baseStats, derivedStats, statsDefinitions, rules, origin, bonuses }) => {
          this.origin.set(origin);
          this.originBonuses.set(bonuses);
          this.statsDefinitions.set(statsDefinitions);
          this.rules.set(rules);

          const heroSnapshot = this.toHeroCombatant(
            hero.name,
            hero.level ?? 1,
            baseStats,
            derivedStats
          );

          this.hero.set(heroSnapshot);
          this.enemy.set(this.demoFactory.createOpponent(heroSnapshot.level));
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
    const rules = this.rules();

    if (!hero || !enemy || !rules || !this.canStrike()) {
      return;
    }

    this.battleError.set(null);
    this.stopWalkingDead();

    try {
      const playerEntry = this.resolver.resolvePlayerAttack(
        this.turn(),
        hero,
        enemy,
        this.enemyCurrentHealth(),
        rules,
        this.walkingPosition(),
        this.streak()
      );

      this.logEntries.update((entries) => [...entries, playerEntry.entry]);
      this.enemyCurrentHealth.set(playerEntry.defenderHealthAfter);
      this.streak.set(playerEntry.entry.result === 'miss' ? 0 : this.streak() + 1);

      if (playerEntry.defenderHealthAfter <= 0) {
        this.finishFight('victory');
        return;
      }

      const enemyEntry = this.resolver.resolveAutoAttack(
        this.turn(),
        enemy,
        hero,
        this.heroCurrentHealth(),
        rules
      );

      this.logEntries.update((entries) => [...entries, enemyEntry.entry]);
      this.heroCurrentHealth.set(enemyEntry.defenderHealthAfter);

      if (enemyEntry.defenderHealthAfter <= 0) {
        this.finishFight('defeat');
        return;
      }

      if (this.turn() >= COMBAT_TURN_LIMIT) {
        this.finishFight('draw');
        return;
      }

      this.turn.update((turn) => turn + 1);
      this.phase.set('player_turn');
      this.startWalkingDead();
    } catch (error: unknown) {
      this.battleError.set(getErrorMessage(error, 'Failed to resolve combat turn.'));
      this.phase.set('idle');
    }
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

  private finishFight(outcome: CombatOutcome) {
    this.stopWalkingDead();
    this.phase.set('finished');

    const hero = this.hero();
    const enemy = this.enemy();

    this.result.set({
      outcome,
      winnerKey:
        outcome === 'draw'
          ? null
          : outcome === 'victory'
            ? hero?.key ?? null
            : enemy?.key ?? null,
      loserKey:
        outcome === 'draw'
          ? null
          : outcome === 'victory'
            ? enemy?.key ?? null
            : hero?.key ?? null,
      rounds: this.logEntries(),
      heroRemainingHealth: this.heroCurrentHealth(),
      enemyRemainingHealth: this.enemyCurrentHealth(),
      turnsPlayed: this.turn(),
    });
  }

  private resetCombatState() {
    this.stopWalkingDead();
    this.result.set(null);
    this.battleError.set(null);
    this.phase.set('idle');
    this.turn.set(1);
    this.streak.set(0);
    this.logEntries.set([]);
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

  private toHeroCombatant(
    name: string,
    level: number,
    baseStats: IHeroStats,
    derivedStats: IHeroDerived
  ): CombatantSnapshot {
    const source = this.originBonusSource();
    const effectiveBaseStats = this.statsService.getFinalStats(baseStats, [source], {
      heroLevel: level,
    }) as IHeroStats;

    return {
      key: 'hero',
      name,
      level,
      baseStats: effectiveBaseStats,
      derived: {
        health: derivedStats.health,
        def: derivedStats.def,
        luck: derivedStats.luck,
        minDmg: derivedStats.minDmg,
        maxDmg: derivedStats.maxDmg,
        critical: derivedStats.critical,
        evasion: derivedStats.evasion,
      },
      bonuses: {
        hitBonusFromItems: 0,
        critBonusFromItems: 0,
        evasionBonusFromItems: 0,
        damageBonusFromItems: 0,
      },
    };
  }

  private originBonusSource(): BonusSource {
      return {
        name: 'origin',
        bonuses: this.originBonuses().map((bonus) => ({
          target: bonus.target ?? '',
          value: bonus.baseValue,
          type: bonus.type,
          scope: bonus.scope,
          levelsStep: bonus.levelsStep,
          sourceStat: bonus.sourceStat,
          scalingFactor: bonus.scalingFactor,
        })),
      };
    }
}
