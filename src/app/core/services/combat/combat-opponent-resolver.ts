import { inject, Injectable } from '@angular/core';
import { map, Observable, of, switchMap } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { COMBAT_PARTICIPANT_KIND } from '../../domain/combat/combat.model';
import {
  CombatOpponentAdminData,
  CombatOpponentDefinitionReadModel,
  CombatOpponentEquipmentEntryReadModel,
  ResolveCombatOpponentInput,
  ResolvedCombatOpponent,
  ResolvedCombatOpponentEquipment,
  ResolvedCombatOpponentStat,
} from '../../domain/combat/combat-opponent.model';
import { BalanceFormula, FormulaTarget } from '../../domain/formula/formula.model';
import { ItemGenerationCatalog } from '../../domain/item/item-generation.model';
import { Database } from '../../types/database.types';
import { defaultCombatFormulaBonusesForOpponent } from '../../utils/combat-formula-bonuses';
import { attackPlanFor, naturalAttacksFor } from '../../utils/combat-opponent-attack-plan';
import {
  OPPONENT_EQUIPMENT_MODE,
  equipmentEntriesFor,
  materializeManualEquipment,
} from '../../utils/combat-opponent-equipment-resolution';
import {
  combatParticipantInputFromDbSnapshot,
  equipmentFromDbAttackPlan,
  opponentCombatantSnapshotArgs,
} from '../../utils/combat-opponent-snapshot-mappers';
import {
  coreStatsFrom,
  participantStats,
  scalingVariables,
} from '../../utils/combat-opponent-stat-resolution';
import { opponentLevel } from '../../utils/combat-opponent-range';
import { FormulaRuntimeService } from '../progression/formula-runtime';
import { FormulaService } from '../formula/formula';
import { ItemCatalogService } from '../items/item-catalog';
import { Backend } from '../backend/backend';
import { CombatOpponentAdmin } from './combat-opponent-admin';

const COMBAT_OPPONENT_SCALED_STAT_TARGET = 'combat_opponent_scaled_stat';
type BuildOpponentCombatantSnapshotRpcResult =
  Database['public']['Functions']['build_opponent_combatant_snapshot_for_resolver']['Returns'];

@Injectable({ providedIn: 'root' })
export class CombatOpponentResolver {
  private readonly opponents = inject(CombatOpponentAdmin);
  private readonly formulas = inject(FormulaService);
  private readonly formulaRuntime = inject(FormulaRuntimeService);
  private readonly itemCatalog = inject(ItemCatalogService);
  private readonly backend = inject(Backend);

  resolve(input: ResolveCombatOpponentInput): Observable<ResolvedCombatOpponent> {
    return this.opponents.getAdminData().pipe(
      switchMap((data) =>
        this.resolveScalingFormula(data, input).pipe(
          switchMap((scaling) => {
            const opponent = this.requiredActiveOpponent(data, input.opponentDefinitionId);
            const equipmentEntries = equipmentEntriesFor(data, opponent, input);
            const needsCatalog = equipmentEntries.some(
              (entry) => entry.entryMode === OPPONENT_EQUIPMENT_MODE.manual,
            );
            const catalog$: Observable<ItemGenerationCatalog | null> = needsCatalog
              ? this.itemCatalog.getCatalog()
              : of(null);

            if (equipmentEntries.some(
              (entry) => entry.entryMode === OPPONENT_EQUIPMENT_MODE.generated,
            )) {
              return this.toDbResolvedOpponent(data, input, opponent, scaling, equipmentEntries);
            }

            return catalog$.pipe(
              map((catalog) =>
                this.toResolvedOpponent(data, input, opponent, scaling, equipmentEntries, catalog),
              ),
            );
          }),
        ),
      ),
    );
  }

  private toResolvedOpponent(
    data: CombatOpponentAdminData,
    input: ResolveCombatOpponentInput,
    opponent: CombatOpponentDefinitionReadModel,
    scaling: { target: FormulaTarget; formula: BalanceFormula },
    equipmentEntries: CombatOpponentEquipmentEntryReadModel[],
    catalog: ItemGenerationCatalog | null,
  ): ResolvedCombatOpponent {
    const level = opponentLevel(input);
    const scaledStats = this.scaledStatsFor(data, opponent, input, scaling);
    const naturalAttackSources = naturalAttacksFor(data, opponent, level);
    const equipment = equipmentEntries.map((entry) =>
      this.materializeEquipment(entry, catalog),
    );
    const attackPlan = attackPlanFor(opponent.key, input.side, naturalAttackSources, equipment);

    return {
      participant: {
        side: input.side,
        displayName: opponent.label,
        level,
        reference: {
          participantKind: COMBAT_PARTICIPANT_KIND.opponent,
          heroId: null,
          opponentDefinitionId: opponent.id,
        },
        stats: coreStatsFrom(scaledStats, naturalAttackSources),
        baseStats: participantStats(input.side, scaledStats),
        formulaBonuses: defaultCombatFormulaBonusesForOpponent(),
        attackPlan,
      },
      opponent,
      scalingFormula: {
        targetKey: scaling.target.key,
        formulaId: scaling.formula.id,
        label: scaling.formula.label,
        expression: scaling.formula.expression,
      },
      scaledStats,
      naturalAttackSources,
      equipment,
    };
  }

  private toDbResolvedOpponent(
    data: CombatOpponentAdminData,
    input: ResolveCombatOpponentInput,
    opponent: CombatOpponentDefinitionReadModel,
    scaling: { target: FormulaTarget; formula: BalanceFormula },
    equipmentEntries: CombatOpponentEquipmentEntryReadModel[],
  ): Observable<ResolvedCombatOpponent> {
    const level = opponentLevel(input);
    const scaledStats = this.scaledStatsFor(data, opponent, input, scaling);
    const naturalAttackSources = naturalAttacksFor(data, opponent, level);

    return this.backend.rpc<BuildOpponentCombatantSnapshotRpcResult>(
      RPC.build_opponent_combatant_snapshot_for_resolver,
      opponentCombatantSnapshotArgs(input, level),
    ).pipe(
      map((snapshot) => {
        const participant = combatParticipantInputFromDbSnapshot(snapshot);

        return {
          participant,
          opponent,
          scalingFormula: {
            targetKey: scaling.target.key,
            formulaId: scaling.formula.id,
            label: scaling.formula.label,
            expression: scaling.formula.expression,
          },
          scaledStats,
          naturalAttackSources,
          equipment: equipmentFromDbAttackPlan(equipmentEntries, participant.attackPlan),
        };
      }),
    );
  }

  private resolveScalingFormula(
    data: CombatOpponentAdminData,
    input: ResolveCombatOpponentInput,
  ): Observable<{ target: FormulaTarget; formula: BalanceFormula }> {
    const opponent = this.requiredActiveOpponent(data, input.opponentDefinitionId);
    const formulaId = input.scalingFormulaId ?? opponent.defaultScalingFormulaId;

    if (!formulaId) {
      return this.formulas.getAssignedFormula(COMBAT_OPPONENT_SCALED_STAT_TARGET).pipe(
        map((resolution) => ({
          target: resolution.target,
          formula: resolution.formula,
        })),
      );
    }

    return this.formulas.getAdminData().pipe(
      map((formulaData) => {
        const target = formulaData.targets.find(
          (entry) => entry.key === COMBAT_OPPONENT_SCALED_STAT_TARGET,
        );
        const formula = formulaData.formulas.find((entry) => entry.id === formulaId);

        if (!target) {
          throw new Error(
            `Missing balance formula target "${COMBAT_OPPONENT_SCALED_STAT_TARGET}".`,
          );
        }

        if (!formula?.isEnabled) {
          throw new Error(`Missing active opponent scaling formula "${formulaId}".`);
        }

        return { target, formula };
      }),
    );
  }

  private scaledStatsFor(
    data: CombatOpponentAdminData,
    opponent: CombatOpponentDefinitionReadModel,
    input: ResolveCombatOpponentInput,
    scaling: { target: FormulaTarget; formula: BalanceFormula },
  ): ResolvedCombatOpponentStat[] {
    return data.statValues
      .filter((entry) => entry.opponentDefinitionId === opponent.id)
      .map((entry) => {
        const result = this.formulaRuntime.evaluate(
          scaling.formula.expression,
          scalingVariables(entry.baseValue, input),
          scaling.target.allowedVariables,
        );

        if (result.error || result.value === null) {
          throw new Error(
            `${scaling.formula.label} could not scale opponent stat "${entry.statKey}": ${result.error ?? 'unknown error'}`,
          );
        }

        return {
          statKey: entry.statKey,
          baseValue: entry.baseValue,
          scaledValue: Math.max(0, Math.round(result.value)),
        };
      });
  }

  private materializeEquipment(
    entry: CombatOpponentEquipmentEntryReadModel,
    catalog: ItemGenerationCatalog | null,
  ): ResolvedCombatOpponentEquipment {
    return materializeManualEquipment(entry, catalog);
  }

  private requiredActiveOpponent(
    data: CombatOpponentAdminData,
    opponentDefinitionId: string,
  ): CombatOpponentDefinitionReadModel {
    const opponent = data.opponents.find((entry) => entry.id === opponentDefinitionId);

    if (!opponent) {
      throw new Error(`Missing combat opponent definition "${opponentDefinitionId}".`);
    }

    if (!opponent.isActive) {
      throw new Error(`Combat opponent definition "${opponent.key}" is inactive.`);
    }

    return opponent;
  }
}
