import { Signal, computed, inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import {
  GameCopyRegistry,
  GameCopyRegistryArgs,
  GameCopyRegistryKind,
} from '../../types/game-copy-registry.types';
import { Backend } from '../backend/backend';
import { GAME_COPY_READERS } from './game-copy.readers';

@Injectable({ providedIn: 'root' })
export class GameCopy {
  private readonly backend = inject(Backend);
  private readonly refreshRevisions = signal<Record<string, number>>({});

  getCopy<Kind extends GameCopyRegistryKind>(
    kind: Kind,
    args: GameCopyRegistryArgs[Kind],
  ): Observable<GameCopyRegistry[Kind]> {
    return GAME_COPY_READERS[kind](this.backend, args);
  }

  refreshCopy<Kind extends GameCopyRegistryKind>(
    kind: Kind,
    locale: string,
  ): void {
    const key = this.refreshKey(kind, locale);

    this.refreshRevisions.update((revisions) => ({
      ...revisions,
      [key]: (revisions[key] ?? 0) + 1,
    }));
  }

  refreshRevision<Kind extends GameCopyRegistryKind>(
    kind: Kind,
    locale: string,
  ): Signal<number> {
    const key = this.refreshKey(kind, locale);

    return computed(() => this.refreshRevisions()[key] ?? 0);
  }

  private refreshKey(kind: GameCopyRegistryKind, locale: string): string {
    return `${kind}:${locale}`;
  }
}
