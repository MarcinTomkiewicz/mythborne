import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, switchMap } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { GuildArmoryReadModel } from '../../domain/guild/guild-armory.model';
import {
  GetHeroGuildArmoryItemRowsRpcRow,
  GetHeroGuildArmoryLoanRowsRpcRow,
} from '../../types/guild-rpc.types';
import { mapGuildArmoryReadModel } from '../../utils/guild-armory-read-mappers';
import { Backend } from '../backend/backend';
import { ActiveHero } from '../hero/active-hero';

@Injectable({ providedIn: 'root' })
export class PlayerGuildArmory {
  private readonly activeHero = inject(ActiveHero);
  private readonly backend = inject(Backend);

  getActiveHeroGuildArmory(
    includeTerminalLoans = false,
  ): Observable<GuildArmoryReadModel> {
    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) =>
        this.getHeroGuildArmory(context.heroId, includeTerminalLoans).pipe(
          map((readModel) => {
            assertActiveContext(this.activeHero.state(), context);

            return readModel;
          }),
        ),
      ),
    );
  }

  getHeroGuildArmory(
    heroId: string,
    includeTerminalLoans = false,
  ): Observable<GuildArmoryReadModel> {
    return forkJoin({
      itemRows: this.backend.rpc<GetHeroGuildArmoryItemRowsRpcRow[]>(
        RPC.get_hero_guild_armory_item_rows,
        { p_hero_id: heroId },
      ),
      loanRows: this.backend.rpc<GetHeroGuildArmoryLoanRowsRpcRow[]>(
        RPC.get_hero_guild_armory_loan_rows,
        { p_hero_id: heroId, p_include_terminal: includeTerminalLoans },
      ),
    }).pipe(
      map(({ itemRows, loanRows }) => mapGuildArmoryReadModel(itemRows, loanRows)),
    );
  }
}

function assertActiveContext(
  active: { heroId: string | null; serverId: string | null } | null,
  expected: { heroId: string; serverId: string },
): void {
  if (active?.heroId !== expected.heroId || active.serverId !== expected.serverId) {
    throw new Error('Guild armory context changed.');
  }
}
