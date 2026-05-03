import { inject, Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import {
  EstateRelocationInput,
  EstateRelocationResult,
} from '../../domain/estate/estate-relocation.model';
import {
  firstRelocateHeroEstateRow,
  mapRelocateHeroEstateResult,
  toRelocateHeroEstateRpcArgs,
} from '../../utils/estate-relocation-rpc';
import { Backend } from '../backend/backend';
import { ActiveHero } from '../hero/active-hero';
import { RelocateHeroEstateRpcRow } from '../../types/estate-relocation-rpc.types';
import { EstateAddresses } from './estate-addresses';

@Injectable({ providedIn: 'root' })
export class EstateRelocation {
  private readonly backend = inject(Backend);
  private readonly activeHero = inject(ActiveHero);
  private readonly estateAddresses = inject(EstateAddresses);

  relocateActiveHeroEstate(
    input: EstateRelocationInput,
  ): Observable<EstateRelocationResult> {
    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) =>
        this.backend
          .rpc<RelocateHeroEstateRpcRow[]>(
            RPC.relocate_hero_estate_to_empty_address,
            toRelocateHeroEstateRpcArgs(context.heroId, input),
          )
          .pipe(
            map((rows) =>
              mapRelocateHeroEstateResult(firstRelocateHeroEstateRow(rows)),
            ),
            switchMap((result) =>
              this.activeHero.loadActiveHero().pipe(
                switchMap((state) => {
                  const estateId = state?.heroRow?.estate_id ?? null;

                  if (estateId !== result.newEstateId) {
                    throw new Error(
                      'Estate relocation invariant failed: active hero was not assigned to the new estate.',
                    );
                  }

                  return this.estateAddresses
                    .getCurrentAddress({
                      estateId,
                      heroId: result.heroId,
                      serverId: result.serverId,
                    })
                    .pipe(
                      map((address) => {
                        if (!address) {
                          throw new Error(
                            'Estate relocation invariant failed: new estate address is not readable for the active hero.',
                          );
                        }

                        return result;
                      }),
                    );
                }),
              ),
            ),
          ),
      ),
    );
  }
}
