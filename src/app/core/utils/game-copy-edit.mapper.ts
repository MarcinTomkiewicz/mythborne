import {
  GameCopyLocale,
  GameCopyTextEntry,
  GameCopyTextEntryLocales,
  GameCopyTextUpdateResult,
} from '../domain/game-copy/game-copy-edit.model';
import {
  GetGameCopyTextEntryLocalesRpcResult,
  UpdateGameCopyTextEntryRpcResult,
} from '../types/game-copy-rpc.types';
import {
  JsonRecord,
  optionalNullableText,
  read,
  requiredArray,
  requiredBoolean,
  requiredText,
} from './json-read';
import { requireSingleRpcRow } from './rpc-result';

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
