import { Injectable, inject } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { COMBAT_FORMULA_TARGET } from '../../constants/combat-formula-targets.const';
import { RPC } from '../../constants/rpc.const';
import {
  COMBAT_SIDE,
  CombatFormulaRules,
  CombatAttackEvent,
} from '../../domain/combat/combat.model';
import {
  CombatSandboxStepInput,
  CombatSandboxStepResolution,
} from '../../domain/combat/combat-sandbox-step.model';
import { resolveCombatAttack } from '../../utils/combat-attack-resolution';
import { toCombatSandboxParticipant } from '../../utils/combat-sandbox-participant';
import { Backend } from '../backend/backend';
import { FormulaService } from '../formula/formula';
import { FormulaRuntimeService } from '../progression/formula-runtime';

@Injectable({ providedIn: 'root' })
export class CombatSandboxStepResolverService {
  private readonly backend = inject(Backend);
  private readonly formulas = inject(FormulaService);
  private readonly formulaRuntime = inject(FormulaRuntimeService);

  resolveStep(input: CombatSandboxStepInput): Observable<CombatSandboxStepResolution> {
    return forkJoin({
      turnLimit: this.backend.rpc<number | null>(RPC.get_combat_turn_limit),
      rules: this.getFormulaRules(),
    }).pipe(
      map(({ turnLimit, rules }) =>
        this.resolveWithRules(input, this.validTurnLimit(turnLimit), rules),
      ),
    );
  }

  private resolveWithRules(
    input: CombatSandboxStepInput,
    turnLimit: number,
    rules: CombatFormulaRules,
  ): CombatSandboxStepResolution {
    const initiator = toCombatSandboxParticipant(COMBAT_SIDE.initiator, input.hero, input.heroId);
    const defender = toCombatSandboxParticipant(COMBAT_SIDE.defender, input.enemy, null);
    const events: CombatAttackEvent[] = [];

    const playerEvent = resolveCombatAttack({
      turnNumber: input.turnNumber,
      attackOrder: input.attackOrderStart,
      slot: initiator.attackPlan.slots[0],
      actor: initiator,
      target: defender,
      targetHealthBefore: input.enemyHealth,
      timingInputs: [{
        turnNumber: input.turnNumber,
        side: COMBAT_SIDE.initiator,
        slotIndex: 0,
        indicatorPosition: input.indicatorPosition,
        streak: input.streak,
      }],
      rules,
      formulaRuntime: this.formulaRuntime,
    });
    events.push(playerEvent);

    if (playerEvent.targetHealthAfter <= 0) {
      return {
        initiator,
        defender,
        events,
        heroHealth: input.heroHealth,
        enemyHealth: playerEvent.targetHealthAfter,
        outcome: 'victory',
        turnsPlayed: input.turnNumber,
        turnLimit,
      };
    }

    const enemyEvent = resolveCombatAttack({
      turnNumber: input.turnNumber,
      attackOrder: input.attackOrderStart + 1,
      slot: defender.attackPlan.slots[0],
      actor: defender,
      target: initiator,
      targetHealthBefore: input.heroHealth,
      timingInputs: [],
      rules,
      formulaRuntime: this.formulaRuntime,
    });
    events.push(enemyEvent);

    if (enemyEvent.targetHealthAfter <= 0) {
      return {
        initiator,
        defender,
        events,
        heroHealth: enemyEvent.targetHealthAfter,
        enemyHealth: playerEvent.targetHealthAfter,
        outcome: 'defeat',
        turnsPlayed: input.turnNumber,
        turnLimit,
      };
    }

    return {
      initiator,
      defender,
      events,
      heroHealth: enemyEvent.targetHealthAfter,
      enemyHealth: playerEvent.targetHealthAfter,
      outcome: input.turnNumber >= turnLimit ? 'draw' : null,
      turnsPlayed: input.turnNumber,
      turnLimit,
    };
  }

  private getFormulaRules(): Observable<CombatFormulaRules> {
    return forkJoin({
      hitGreenZone: this.formulas.getAssignedFormula(COMBAT_FORMULA_TARGET.hitGreenZone),
      evasionChance: this.formulas.getAssignedFormula(COMBAT_FORMULA_TARGET.evasionChance),
      criticalChance: this.formulas.getAssignedFormula(COMBAT_FORMULA_TARGET.criticalChance),
      finalDamage: this.formulas.getAssignedFormula(COMBAT_FORMULA_TARGET.finalDamage),
    });
  }

  private validTurnLimit(value: number | null): number {
    const normalized = Math.floor(Number(value));

    if (!Number.isFinite(normalized) || normalized <= 0) {
      throw new Error('Limit tur walki musi być dodatnią liczbą.');
    }

    return normalized;
  }
}
