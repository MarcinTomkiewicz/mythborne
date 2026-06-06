import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { TradePageContext, TradePageCopy } from '../../domain/trade/player-trade.model';
import {
  GetTradePageContextRpcArgs,
  GetTradePageContextRpcResult,
  GetTradePageCopyRpcResult,
} from '../../types/player-trade-rpc.types';
import { mapTradePageContext } from '../../utils/trade-page-context.mapper';
import { mapTradePageCopy } from '../../utils/trade-page-copy.mapper';
import { trimText } from '../../utils/normalize-text';
import { Backend } from '../backend/backend';

@Injectable({ providedIn: 'root' })
export class PlayerTrades {
  private readonly backend = inject(Backend);

  getPageCopy(): Observable<TradePageCopy> {
    return this.backend
      .rpc<GetTradePageCopyRpcResult>(RPC.get_trade_page_copy)
      .pipe(map(mapTradePageCopy));
  }

  getPageContext(heroId: string, serverId: string): Observable<TradePageContext> {
    const args: GetTradePageContextRpcArgs = {
      p_hero_id: requiredText(heroId, 'heroId'),
    };
    const expectedServerId = requiredText(serverId, 'serverId');

    return this.backend
      .rpc<GetTradePageContextRpcResult>(RPC.get_trade_page_context, args)
      .pipe(
        map((context) =>
          mapTradePageContext(context, {
            heroId: args.p_hero_id,
            serverId: expectedServerId,
          }),
        ),
      );
  }
}

function requiredText(value: string | null | undefined, field: string): string {
  const normalized = trimText(value);

  if (!normalized) {
    throw new Error(`${field} is required for trade page RPC.`);
  }

  return normalized;
}
