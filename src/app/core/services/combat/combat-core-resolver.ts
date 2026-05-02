import { Injectable, inject } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { COMBAT_FORMULA_TARGET } from '../../constants/combat-formula-targets.const';
import { RPC } from '../../constants/rpc.const';
import {
  CombatFormulaRules,
  CombatResolutionInput,
  CombatResolutionResult,
} from '../../domain/combat/combat.model';
import { baseStat } from '../../utils/combat-formula-context';
import { resolveCombatTurns } from '../../utils/combat-turn-engine';
import { Backend } from '../backend/backend';
import { FormulaService } from '../formula/formula';
import { FormulaRuntimeService } from '../progression/formula-runtime';
import { CombatInitiativeOrderService } from './combat-initiative-order';

@Injectable({ providedIn: 'root' })
export class CombatCoreResolverService {
  private readonly backend = inject(Backend);
  private readonly formulas = inject(FormulaService);
  private readonly formulaRuntime = inject(FormulaRuntimeService);
  private readonly initiativeOrder = inject(CombatInitiativeOrderService);

  resolveCombat(input: CombatResolutionInput): Observable<CombatResolutionResult> {
    return forkJoin({
      turnLimit: this.backend.rpc<number | null>(RPC.get_combat_turn_limit),
      formulas: this.getFormulaRules(),
      turnOrder: this.initiativeOrder.orderTurnSlots({
        side: input.initiator.side,
        attackPlan: input.initiator.attackPlan,
        stats: {
          intelligence: baseStat(input.initiator, 'intelligence'),
          agility: baseStat(input.initiator, 'agility'),
        },
      }, {
        side: input.defender.side,
        attackPlan: input.defender.attackPlan,
        stats: {
          intelligence: baseStat(input.defender, 'intelligence'),
          agility: baseStat(input.defender, 'agility'),
        },
      }),
    }).pipe(
      map(({ turnLimit, formulas, turnOrder }) =>
        resolveCombatTurns({
          combat: input,
          turnLimit: this.validTurnLimit(turnLimit),
          rules: formulas,
          orderedSlots: turnOrder.slots,
          formulaRuntime: this.formulaRuntime,
        }),
      ),
    );
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
      throw new Error('Combat turn limit configuration must be a positive number.');
    }

    return normalized;
  }
}
