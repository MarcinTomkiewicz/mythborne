import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { COMBAT_SIDE } from '../../domain/combat/combat.model';
import {
  CombatInitiativeParticipantInput,
  CombatInitiativeSlot,
  CombatTurnOrderPlan,
} from '../../domain/combat/combat-attack-plan.model';
import { FormulaService } from '../formula/formula';
import { FormulaRuntimeService } from '../progression/formula-runtime';

export const COMBAT_INITIATIVE_SCORE_TARGET = 'combat_initiative_score';

@Injectable({ providedIn: 'root' })
export class CombatInitiativeOrderService {
  private readonly formulas = inject(FormulaService);
  private readonly formulaRuntime = inject(FormulaRuntimeService);

  orderTurnSlots(
    initiator: CombatInitiativeParticipantInput,
    defender: CombatInitiativeParticipantInput,
  ): Observable<CombatTurnOrderPlan> {
    return this.formulas.getAssignedFormula(COMBAT_INITIATIVE_SCORE_TARGET).pipe(
      map((resolution) => {
        const slots = [
          ...this.scoreParticipantSlots(
            initiator,
            resolution.formula.expression,
            resolution.target.allowedVariables,
          ),
          ...this.scoreParticipantSlots(
            defender,
            resolution.formula.expression,
            resolution.target.allowedVariables,
          ),
        ].sort((left, right) => {
          const scoreDelta = right.initiativeScore - left.initiativeScore;

          if (scoreDelta !== 0) {
            return scoreDelta;
          }

          if (left.side !== right.side) {
            return left.side === COMBAT_SIDE.initiator ? -1 : 1;
          }

          return left.attackIndex - right.attackIndex;
        });

        return {
          slots,
          formula: {
            targetKey: resolution.target.key,
            targetLabel: resolution.target.label,
            targetDescription: resolution.target.description,
            formulaId: resolution.formula.id,
            formulaLabel: resolution.formula.label,
            formulaExpression: resolution.formula.expression,
            formulaDescription: resolution.formula.description,
            assignmentSource: resolution.source,
          },
          explanation: {
            scoreMeaning: 'Higher initiative score acts earlier.',
            tieBreaker: 'If initiative scores tie, the initiating side acts first.',
            formulaSource: 'Initiative score is evaluated from the DB-backed combat_initiative_score formula assignment.',
          },
        };
      }),
    );
  }

  private scoreParticipantSlots(
    participant: CombatInitiativeParticipantInput,
    expression: string,
    allowedVariables: readonly string[],
  ): CombatInitiativeSlot[] {
    const attackCount = participant.attackPlan.slots.length;

    return participant.attackPlan.slots.map((slot, index) => {
      const attackIndex = index + 1;
      const result = this.formulaRuntime.evaluate(
        expression,
        {
          combatantIntelligence: participant.stats.intelligence,
          combatantAgility: participant.stats.agility,
          attackIndex,
          attackCount,
        },
        allowedVariables,
      );

      if (result.error || result.value === null) {
        throw new Error(`Combat initiative formula is invalid: ${result.error ?? 'unknown error'}`);
      }

      return {
        ...slot,
        initiativeScore: result.value,
        attackIndex,
        attackCount,
      };
    });
  }
}
