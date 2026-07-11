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

export interface GameCopyEditEntrySelection {
  locales: GameCopyLocale[];
  entriesByLocale: Record<string, GameCopyTextEntry>;
  selectedEntry: GameCopyTextEntry;
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

export interface GameCopyEditUi {
  dialog: {
    title: string;
  };
  metadata: {
    gameCopyKindLabel: string;
    copyPathLabel: string;
    localeLabel: string;
  };
  fields: {
    value: {
      label: string;
      ariaLabel: string;
    };
    reason: {
      label: string;
      placeholder: string;
      ariaLabel: string;
    };
  };
  actions: {
    save: {
      label: string;
      ariaLabel: string;
      tooltip: string;
    };
    cancel: {
      label: string;
      ariaLabel: string;
    };
    close: {
      ariaLabel: string;
    };
  };
  messages: {
    loading: string;
    missingEntry: string;
    notEditable: string;
    saved: string;
    loadError: string;
    saveError: string;
    dirtyGuard: string;
  };
}
