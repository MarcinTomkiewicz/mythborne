import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { RPC } from '../../constants/rpc.const';
import {
  GameCopyTextEntryLocales,
  GameCopyTextUpdateResult,
} from '../../domain/game-copy/game-copy-edit.model';
import {
  GetGameCopyTextEntryLocalesRpcResult,
  UpdateGameCopyTextEntryRpcResult,
} from '../../types/game-copy-rpc.types';
import {
  mapGameCopyTextEntryLocales,
  mapGameCopyTextUpdateResult,
} from '../../domain/game-copy/game-copy-edit.mapper';
import { Backend } from '../backend/backend';

@Injectable({ providedIn: 'root' })
export class GameCopyEditAdmin {
  private readonly backend = inject(Backend);

  readonly canManage = toSignal(
    this.backend
      .rpc<boolean>(RPC.can_manage_game_copy)
      .pipe(catchError(() => of(false))),
    { initialValue: false },
  );

  getEntryLocales(
    gameCopyKind: string,
    copyPath: string,
  ): Observable<GameCopyTextEntryLocales> {
    return this.backend
      .rpc<GetGameCopyTextEntryLocalesRpcResult>(
        RPC.get_game_copy_text_entry_locales,
        {
          p_game_copy_kind: gameCopyKind,
          p_copy_path: copyPath,
        },
      )
      .pipe(map(mapGameCopyTextEntryLocales));
  }

  updateEntry(
    gameCopyKind: string,
    copyPath: string,
    locale: string,
    value: string,
    reason: string,
  ): Observable<GameCopyTextUpdateResult> {
    return this.backend
      .rpc<UpdateGameCopyTextEntryRpcResult>(RPC.update_game_copy_text_entry, {
        p_game_copy_kind: gameCopyKind,
        p_copy_path: copyPath,
        p_locale: locale,
        p_value: value,
        p_reason: reason,
      })
      .pipe(map(mapGameCopyTextUpdateResult));
  }
}
