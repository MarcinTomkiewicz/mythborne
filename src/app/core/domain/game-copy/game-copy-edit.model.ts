import { GameCopyRegistryKind } from '../../types/game-copy-registry.types';

export interface GameCopyLocale {
  locale: string;
  label: string;
  nativeLabel: string;
  isActive: boolean;
}

export interface GameCopyTextEntry {
  locale: string;
  exists: boolean;
  isEditable: boolean;
  value: string | null;
}

export interface GameCopyTextEntryLocales {
  availableLocales: GameCopyLocale[];
  entries: GameCopyTextEntry[];
}

export interface GameCopyTextUpdateResult {
  locale: string;
  value: string;
  updatedAt: string;
}

export interface GameCopyEditTarget {
  gameCopyKind: GameCopyRegistryKind;
  copyPath: string;
  locale: string;
}
