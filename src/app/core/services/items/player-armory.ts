import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, switchMap } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { HeroArmoryReadModel } from '../../domain/item/item-equipment.model';
import {
  GetHeroArmoryItemsRpcArgs,
  GetHeroArmoryItemsRpcRow,
  GetHeroArmoryVisibilityStateRpcArgs,
  GetHeroArmoryVisibilityStateRpcRow,
} from '../../types/item-equipment-rpc.types';
import { mapHeroArmoryReadModel } from '../../utils/item-equipment-mappers';
import { Backend } from '../backend/backend';
import { ActiveHero } from '../hero/active-hero';

@Injectable({ providedIn: 'root' })
export class PlayerArmory {
  private readonly activeHero = inject(ActiveHero);
  private readonly backend = inject(Backend);

  getArmory(): Observable<HeroArmoryReadModel> {
    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) =>
        forkJoin({
          visibility: this.getVisibility(context.heroId),
          items: this.getVisibleItems(context.heroId),
        }).pipe(
          map((data) =>
            mapHeroArmoryReadModel(
              context.heroId,
              firstRow(data.visibility, RPC.get_hero_armory_visibility_state),
              data.items,
            ),
          ),
        ),
      ),
    );
  }

  private getVisibility(
    heroId: string,
  ): Observable<GetHeroArmoryVisibilityStateRpcRow[]> {
    const args: GetHeroArmoryVisibilityStateRpcArgs = {
      p_hero_id: heroId,
    };

    return this.backend.rpc<GetHeroArmoryVisibilityStateRpcRow[]>(
      RPC.get_hero_armory_visibility_state,
      args,
    );
  }

  private getVisibleItems(heroId: string): Observable<GetHeroArmoryItemsRpcRow[]> {
    const args: GetHeroArmoryItemsRpcArgs = {
      p_hero_id: heroId,
    };

    return this.backend.rpc<GetHeroArmoryItemsRpcRow[]>(
      RPC.get_hero_armory_items,
      args,
    );
  }
}

function firstRow<T>(rows: readonly T[], rpcName: string): T {
  const row = rows[0];

  if (!row) {
    throw new Error(`${rpcName} returned no armory visibility row.`);
  }

  return row;
}
