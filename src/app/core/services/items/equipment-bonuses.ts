import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { Bonus, BonusScope } from '../../types/bonus.types';
import {
  GetHeroEquipmentRuntimeBonusTotalsRpcArgs,
  GetHeroEquipmentRuntimeBonusTotalsRpcRow,
} from '../../types/item-equipment-rpc.types';
import { Backend } from '../backend/backend';

@Injectable({ providedIn: 'root' })
export class EquipmentBonusesService {
  private readonly backend = inject(Backend);

  getEquipmentBonusesForHero(heroId: string): Observable<Bonus[]> {
    const args: GetHeroEquipmentRuntimeBonusTotalsRpcArgs = {
      p_hero_id: heroId,
    };

    return this.backend.rpc<GetHeroEquipmentRuntimeBonusTotalsRpcRow[]>(
      RPC.get_hero_equipment_runtime_bonus_totals,
      args,
    ).pipe(
      map((rows) => rows.map((row) => mapRuntimeEquipmentBonusTotal(heroId, row))),
    );
  }
}

function mapRuntimeEquipmentBonusTotal(
  heroId: string,
  row: GetHeroEquipmentRuntimeBonusTotalsRpcRow,
): Bonus {
  if (row.hero_id !== heroId) {
    throw new Error('Equipment bonus totals returned a row for a different hero.');
  }

  return {
    target: row.target_key,
    value: row.total_value,
    type: 'flat',
    scope: row.scope_key as BonusScope,
    levelsStep: null,
    sourceStat: null,
    scalingFactor: null,
  };
}
