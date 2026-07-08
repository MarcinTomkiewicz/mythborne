import { Json } from '../../types/database.types';
import {
  GetGameCopyTextEntryLocalesRpcResult,
  UpdateGameCopyTextEntryRpcResult,
} from '../../types/game-copy-rpc.types';
import {
  JsonRecord,
  optionalNullableText,
  read,
  requiredArray,
  requiredBoolean,
  requiredRecord,
  requiredText,
} from '../../utils/json-read';
import { requireSingleRpcRow } from '../../utils/rpc-result';
import {
  GameCopyEditUi,
  GameCopyLocale,
  GameCopyTextEntry,
  GameCopyTextEntryLocales,
  GameCopyTextUpdateResult,
} from './game-copy-edit.model';

export function mapGameCopyEditUi(value: Json): GameCopyEditUi {
  const root = requiredRecord(value, 'admin_game_copy_edit');

  return {
    dialog: mapDialog(
      requiredRecord(read(root, 'dialog'), 'admin_game_copy_edit.dialog'),
    ),
    metadata: mapMetadata(
      requiredRecord(read(root, 'metadata'), 'admin_game_copy_edit.metadata'),
    ),
    fields: mapFields(
      requiredRecord(read(root, 'fields'), 'admin_game_copy_edit.fields'),
    ),
    actions: mapActions(
      requiredRecord(read(root, 'actions'), 'admin_game_copy_edit.actions'),
    ),
    messages: mapMessages(
      requiredRecord(read(root, 'messages'), 'admin_game_copy_edit.messages'),
    ),
  };
}

export function mapGameCopyTextEntryLocales(
  rows: GetGameCopyTextEntryLocalesRpcResult,
): GameCopyTextEntryLocales {
  const row = requireSingleRpcRow(rows, 'get_game_copy_text_entry_locales');

  return {
    availableLocales: requiredArray(
      row.availableLocalesJson,
      'game_copy_text_entry_locales.availableLocalesJson',
    ).map(mapLocaleJson),
    entries: requiredArray(
      row.entriesJson,
      'game_copy_text_entry_locales.entriesJson',
    ).map(mapLocaleEntryJson),
  };
}

export function mapGameCopyTextUpdateResult(
  rows: UpdateGameCopyTextEntryRpcResult,
): GameCopyTextUpdateResult {
  const row = requireSingleRpcRow(rows, 'update_game_copy_text_entry');

  return {
    locale: row.locale,
    value: row.value,
    updatedAt: row.updatedAt,
  };
}

export function missingGameCopyEntryState(locale: string): GameCopyTextEntry {
  return {
    locale,
    exists: false,
    isEditable: false,
    value: null,
  };
}

export function gameCopyTextEntryFromUpdateResult(
  result: GameCopyTextUpdateResult,
): GameCopyTextEntry {
  return {
    locale: result.locale,
    exists: true,
    isEditable: true,
    value: result.value,
  };
}

function mapDialog(record: JsonRecord): GameCopyEditUi['dialog'] {
  return {
    title: requiredText(read(record, 'title'), 'admin_game_copy_edit.dialog.title'),
  };
}

function mapMetadata(record: JsonRecord): GameCopyEditUi['metadata'] {
  return {
    gameCopyKindLabel: requiredText(
      read(record, 'gameCopyKindLabel'),
      'admin_game_copy_edit.metadata.gameCopyKindLabel',
    ),
    copyPathLabel: requiredText(
      read(record, 'copyPathLabel'),
      'admin_game_copy_edit.metadata.copyPathLabel',
    ),
    localeLabel: requiredText(
      read(record, 'localeLabel'),
      'admin_game_copy_edit.metadata.localeLabel',
    ),
  };
}

function mapFields(record: JsonRecord): GameCopyEditUi['fields'] {
  const value = requiredRecord(read(record, 'value'), 'admin_game_copy_edit.fields.value');
  const reason = requiredRecord(
    read(record, 'reason'),
    'admin_game_copy_edit.fields.reason',
  );

  return {
    value: {
      label: requiredText(read(value, 'label'), 'admin_game_copy_edit.fields.value.label'),
      ariaLabel: requiredText(
        read(value, 'ariaLabel'),
        'admin_game_copy_edit.fields.value.ariaLabel',
      ),
    },
    reason: {
      label: requiredText(read(reason, 'label'), 'admin_game_copy_edit.fields.reason.label'),
      placeholder: requiredText(
        read(reason, 'placeholder'),
        'admin_game_copy_edit.fields.reason.placeholder',
      ),
      ariaLabel: requiredText(
        read(reason, 'ariaLabel'),
        'admin_game_copy_edit.fields.reason.ariaLabel',
      ),
    },
  };
}

function mapActions(record: JsonRecord): GameCopyEditUi['actions'] {
  const save = requiredRecord(read(record, 'save'), 'admin_game_copy_edit.actions.save');
  const cancel = requiredRecord(
    read(record, 'cancel'),
    'admin_game_copy_edit.actions.cancel',
  );
  const close = requiredRecord(read(record, 'close'), 'admin_game_copy_edit.actions.close');

  return {
    save: {
      label: requiredText(read(save, 'label'), 'admin_game_copy_edit.actions.save.label'),
      ariaLabel: requiredText(
        read(save, 'ariaLabel'),
        'admin_game_copy_edit.actions.save.ariaLabel',
      ),
      tooltip: requiredText(
        read(save, 'tooltip'),
        'admin_game_copy_edit.actions.save.tooltip',
      ),
    },
    cancel: {
      label: requiredText(read(cancel, 'label'), 'admin_game_copy_edit.actions.cancel.label'),
      ariaLabel: requiredText(
        read(cancel, 'ariaLabel'),
        'admin_game_copy_edit.actions.cancel.ariaLabel',
      ),
    },
    close: {
      ariaLabel: requiredText(
        read(close, 'ariaLabel'),
        'admin_game_copy_edit.actions.close.ariaLabel',
      ),
    },
  };
}

function mapMessages(record: JsonRecord): GameCopyEditUi['messages'] {
  return {
    loading: requiredText(read(record, 'loading'), 'admin_game_copy_edit.messages.loading'),
    missingEntry: requiredText(
      read(record, 'missingEntry'),
      'admin_game_copy_edit.messages.missingEntry',
    ),
    notEditable: requiredText(
      read(record, 'notEditable'),
      'admin_game_copy_edit.messages.notEditable',
    ),
    saved: requiredText(read(record, 'saved'), 'admin_game_copy_edit.messages.saved'),
    loadError: requiredText(
      read(record, 'loadError'),
      'admin_game_copy_edit.messages.loadError',
    ),
    saveError: requiredText(
      read(record, 'saveError'),
      'admin_game_copy_edit.messages.saveError',
    ),
    dirtyGuard: requiredText(
      read(record, 'dirtyGuard'),
      'admin_game_copy_edit.messages.dirtyGuard',
    ),
  };
}

function mapLocaleJson(record: JsonRecord): GameCopyLocale {
  return {
    locale: requiredText(read(record, 'locale'), 'game_copy_locale.locale'),
    label: requiredText(read(record, 'label'), 'game_copy_locale.label'),
    nativeLabel: requiredText(
      read(record, 'nativeLabel'),
      'game_copy_locale.nativeLabel',
    ),
    isActive: requiredBoolean(read(record, 'isActive'), 'game_copy_locale.isActive'),
  };
}

function mapLocaleEntryJson(record: JsonRecord): GameCopyTextEntry {
  return {
    locale: requiredText(read(record, 'locale'), 'game_copy_locale_entry.locale'),
    exists: requiredBoolean(read(record, 'exists'), 'game_copy_locale_entry.exists'),
    isEditable: requiredBoolean(
      read(record, 'isEditable'),
      'game_copy_locale_entry.isEditable',
    ),
    value: optionalNullableText(read(record, 'value'), 'game_copy_locale_entry.value'),
  };
}
