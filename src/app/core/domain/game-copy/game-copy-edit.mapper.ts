import { Json } from '../../types/database.types';
import {
  GetGameCopyTextEntryLocalesRpcResult,
  UpdateGameCopyTextEntryRpcResult,
} from '../../types/game-copy-rpc.types';
import {
  optionalNullableText,
  read,
  requiredArray,
  requiredBoolean,
  requiredRecord,
  requiredRecordField,
  requiredTextFields,
} from '../../utils/json-read';
import { requireSingleRpcRow } from '../../utils/rpc-result';
import {
  GameCopyEditEntrySelection,
  GameCopyEditUi,
  GameCopyTextEntry,
  GameCopyTextEntryLocales,
  GameCopyTextUpdateResult,
} from './game-copy-edit.model';

export function mapGameCopyEditUi(value: Json): GameCopyEditUi {
  const field = 'admin_game_copy_edit';
  const root = requiredRecord(value, field);
  const dialog = requiredRecordField(root, 'dialog', field);
  const metadata = requiredRecordField(root, 'metadata', field);
  const fields = requiredRecordField(root, 'fields', field);
  const actions = requiredRecordField(root, 'actions', field);
  const messages = requiredRecordField(root, 'messages', field);

  return {
    dialog: requiredTextFields(dialog, `${field}.dialog`, ['title']),
    metadata: requiredTextFields(
      metadata,
      `${field}.metadata`,
      ['gameCopyKindLabel', 'copyPathLabel', 'localeLabel'],
    ),
    fields: {
      value: requiredTextFields(
        requiredRecordField(fields, 'value', `${field}.fields`),
        `${field}.fields.value`,
        ['label', 'ariaLabel'],
      ),
      reason: requiredTextFields(
        requiredRecordField(fields, 'reason', `${field}.fields`),
        `${field}.fields.reason`,
        ['label', 'placeholder', 'ariaLabel'],
      ),
    },
    actions: {
      save: requiredTextFields(
        requiredRecordField(actions, 'save', `${field}.actions`),
        `${field}.actions.save`,
        ['label', 'ariaLabel', 'tooltip'],
      ),
      cancel: requiredTextFields(
        requiredRecordField(actions, 'cancel', `${field}.actions`),
        `${field}.actions.cancel`,
        ['label', 'ariaLabel'],
      ),
      close: requiredTextFields(
        requiredRecordField(actions, 'close', `${field}.actions`),
        `${field}.actions.close`,
        ['ariaLabel'],
      ),
    },
    messages: requiredTextFields(
      messages,
      `${field}.messages`,
      [
        'loading',
        'missingEntry',
        'notEditable',
        'saved',
        'loadError',
        'saveError',
        'dirtyGuard',
      ],
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
    ).map((record) => ({
      ...requiredTextFields(
        record,
        'game_copy_locale',
        ['locale', 'label', 'nativeLabel'],
      ),
      isActive: requiredBoolean(
        read(record, 'isActive'),
        'game_copy_locale.isActive',
      ),
    })),
    entries: requiredArray(
      row.entriesJson,
      'game_copy_text_entry_locales.entriesJson',
    ).map((record) => ({
      ...requiredTextFields(record, 'game_copy_locale_entry', ['locale']),
      exists: requiredBoolean(read(record, 'exists'), 'game_copy_locale_entry.exists'),
      isEditable: requiredBoolean(
        read(record, 'isEditable'),
        'game_copy_locale_entry.isEditable',
      ),
      value: optionalNullableText(
        read(record, 'value'),
        'game_copy_locale_entry.value',
      ),
    })),
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
  return { locale, exists: false, isEditable: false, value: null };
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

export function mapGameCopyEditEntrySelection(
  entryLocales: GameCopyTextEntryLocales,
  requestedLocale: string,
): GameCopyEditEntrySelection {
  const locales = entryLocales.availableLocales.filter((locale) => locale.isActive);
  const entriesByLocale = Object.fromEntries(
    entryLocales.entries.map((entry) => [entry.locale, entry]),
  );

  for (const locale of locales) {
    entriesByLocale[locale.locale] ??= missingGameCopyEntryState(locale.locale);
  }

  entriesByLocale[requestedLocale] ??= missingGameCopyEntryState(requestedLocale);

  return {
    locales,
    entriesByLocale,
    selectedEntry: entriesByLocale[requestedLocale],
  };
}
