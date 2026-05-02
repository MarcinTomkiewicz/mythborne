import { Injectable, inject } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import {
  COMBAT_ATTACK_SOURCE_KIND,
  COMBAT_SIDE,
} from '../../domain/combat/combat.model';
import {
  CombatAdminBalanceData,
  CombatInitiativePreviewInput,
  CombatInitiativePreviewResult,
} from '../../domain/combat/combat-admin-balance.model';
import { CombatInitiativeParticipantInput } from '../../domain/combat/combat-attack-plan.model';
import { Row } from '../../types/supabase.types';
import { mapEncounterDefinition, mapTrialDefinition } from '../../utils/exploration-definition-mappers';
import { mapEncounterCombatCandidate } from '../../utils/exploration-encounter-admin-mappers';
import { mapBalanceFormula } from '../../utils/formula-admin-mappers';
import { mapTrialCombatCandidate } from '../../utils/exploration-trial-admin-mappers';
import { toCombatAdminBalanceData } from '../../utils/combat-admin-balance-mappers';
import { buildCombatAttackPlan } from '../../utils/combat-attack-plan';
import { Backend } from '../backend/backend';
import { FormulaRuntimeService } from '../progression/formula-runtime';
import { CombatInitiativeOrderService } from './combat-initiative-order';
import { CombatOpponentAdmin } from './combat-opponent-admin';

@Injectable({ providedIn: 'root' })
export class CombatAdminBalanceService {
  private readonly backend = inject(Backend);
  private readonly opponents = inject(CombatOpponentAdmin);
  private readonly initiative = inject(CombatInitiativeOrderService);
  private readonly formulaRuntime = inject(FormulaRuntimeService);

  getData(): Observable<CombatAdminBalanceData> {
    return forkJoin({
      opponents: this.opponents.getAdminData(),
      trials: getRows<Row<'trial_definitions'>>(this.backend, TABLES.trial_definitions, [
        { column: 'sort_order', ascending: true },
        { column: 'key', ascending: true },
      ]),
      trialCandidates: getRows<Row<'trial_combat_candidates'>>(
        this.backend,
        TABLES.trial_combat_candidates,
        [
          { column: 'sort_order', ascending: true },
          { column: 'id', ascending: true },
        ],
      ),
      encounters: getRows<Row<'encounter_definitions'>>(this.backend, TABLES.encounter_definitions, [
        { column: 'sort_order', ascending: true },
        { column: 'key', ascending: true },
      ]),
      encounterCandidates: getRows<Row<'encounter_combat_candidates'>>(
        this.backend,
        TABLES.encounter_combat_candidates,
        [
          { column: 'sort_order', ascending: true },
          { column: 'id', ascending: true },
        ],
      ),
      formulas: getRows<Row<'balance_formulas'>>(this.backend, TABLES.balance_formulas, [
        { column: 'scope_key', ascending: true },
        { column: 'key', ascending: true },
      ]),
    }).pipe(
      map((rows) =>
        toCombatAdminBalanceData({
          opponents: rows.opponents,
          trials: rows.trials.map(mapTrialDefinition),
          trialCandidates: rows.trialCandidates.map(mapTrialCombatCandidate),
          encounters: rows.encounters.map(mapEncounterDefinition),
          encounterCandidates: rows.encounterCandidates.map(mapEncounterCombatCandidate),
          formulas: rows.formulas.map(mapBalanceFormula),
        }),
      ),
    );
  }

  previewInitiative(
    input: CombatInitiativePreviewInput,
  ): Observable<CombatInitiativePreviewResult> {
    return this.initiative.orderTurnSlots(
      initiativeParticipant(COMBAT_SIDE.initiator, input.initiatorAttackCount, {
        intelligence: input.initiatorIntelligence,
        agility: input.initiatorAgility,
      }),
      initiativeParticipant(COMBAT_SIDE.defender, input.defenderAttackCount, {
        intelligence: input.defenderIntelligence,
        agility: input.defenderAgility,
      }),
    ).pipe(
      map((plan) => ({
        plan,
        usesRandomFormula: this.formulaRuntime.isNonDeterministic(
          plan.formula.formulaExpression,
        ),
      })),
    );
  }
}

function initiativeParticipant(
  side: CombatInitiativeParticipantInput['side'],
  attackCount: number,
  stats: CombatInitiativeParticipantInput['stats'],
): CombatInitiativeParticipantInput {
  return {
    side,
    stats,
    attackPlan: buildCombatAttackPlan(
      side,
      [{
        source: {
          kind: COMBAT_ATTACK_SOURCE_KIND.unarmed,
          label: side === COMBAT_SIDE.initiator ? 'Initiator preview attack' : 'Defender preview attack',
          opponentAttackSourceId: null,
          sourceItemId: null,
          sourceBaseId: null,
          sourceQualityKey: null,
          sourcePrefixAffixId: null,
          sourceSuffixAffixId: null,
        },
        repeat: Math.max(1, Math.floor(attackCount)),
      }],
      'Initiative preview requires at least one attack slot.',
    ),
  };
}

function getRows<T extends object>(
  backend: Backend,
  table: string,
  orderBy: Array<{ column: string; ascending: boolean }>,
) {
  return backend.getAll<T>({
    table,
    orderBy,
    camelCase: false,
  });
}
