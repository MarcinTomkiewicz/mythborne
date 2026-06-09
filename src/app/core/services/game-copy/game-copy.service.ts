import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  GameCopyRegistry,
  GameCopyRegistryArgs,
  GameCopyRegistryKind,
} from '../../types/game-copy-registry.types';
import { Backend } from '../backend/backend';
import { GAME_COPY_READERS } from './game-copy.readers';

@Injectable({ providedIn: 'root' })
export class GameCopyService {
  private readonly backend = inject(Backend);

  getCopy<Kind extends GameCopyRegistryKind>(
    kind: Kind,
    args: GameCopyRegistryArgs[Kind],
  ): Observable<GameCopyRegistry[Kind]> {
    return GAME_COPY_READERS[kind](this.backend, args);
  }
}
