import { inject, Injectable } from '@angular/core';
import { map, Observable, of, switchMap } from 'rxjs';
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
import { ItemGenerationFactory } from '../../factories/item-generation/item-generation.factory';
import { attackPlanFor, naturalAttacksFor } from '../../utils/combat-opponent-attack-plan';
import {
  OPPONENT_EQUIPMENT_MODE,
  catalogForGeneratedEquipment,
  equipmentEntriesFor,
  generatedItemSnapshot,
  materializeGeneratedEquipment,
  materializeManualEquipment,
} from '../../utils/combat-opponent-equipment-resolution';
import {
  coreStatsFrom,
  participantStats,
  scalingContext,
} from '../../utils/combat-opponent-stat-resolution';
import { opponentLevel } from '../../utils/combat-opponent-range';
import { FormulaRuntimeService } from '../progression/formula-runtime';
import { FormulaService } from '../formula/formula';
import { ItemCatalogService } from '../items/item-catalog';
import { CombatOpponentAdmin } from './combat-opponent-admin';

const COMBAT_OPPONENT_SCALED_STAT_TARGET = 'combat_opponent_scaled_stat';

@Injectable({ providedIn: 'root' })
export class CombatOpponentResolver {
  private readonly opponents = inject(CombatOpponentAdmin);
  private readonly formulas = inject(FormulaService);
  private readonly formulaRuntime = inject(FormulaRuntimeService);
  private readonly itemCatalog = inject(ItemCatalogService);
  private readonly itemGeneration = inject(ItemGenerationFactory);

  resolve(input: ResolveCombatOpponentInput): Observable<ResolvedCombatOpponent> {
    return this.opponents.getAdminData().pipe(
      switchMap((data) =>
        this.resolveScalingFormula(data, input).pipe(
          switchMap((scaling) => {
            const opponent = this.requiredActiveOpponent(data, input.opponentDefinitionId);
            const equipmentEntries = equipmentEntriesFor(data, opponent, input);
            const catalog$: Observable<ItemGenerationCatalog | null> = equipmentEntries.length > 0
              ? this.itemCatalog.getCatalog()
              : of(null);

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
      this.materializeEquipment(entry, level, catalog),
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
          scalingContext(entry.baseValue, input),
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
    level: number,
    catalog: ItemGenerationCatalog | null,
  ): ResolvedCombatOpponentEquipment {
    if (entry.entryMode === OPPONENT_EQUIPMENT_MODE.generated) {
      if (!catalog) {
        throw new Error('Generated opponent equipment requires item generation catalog data.');
      }

      const scopedCatalog = catalogForGeneratedEquipment(entry, catalog);
      const generated = this.itemGeneration.generate(level, scopedCatalog);
      return materializeGeneratedEquipment(entry, generatedItemSnapshot(entry, generated));
    }

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
