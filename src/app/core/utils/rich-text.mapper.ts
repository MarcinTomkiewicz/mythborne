import {
  RichTextFragment,
  RichTextTone,
} from '../domain/rich-text/rich-text.model';
import { Json } from '../types/database.types';
import {
  JsonRecord,
  optionalNullableNumber,
  optionalNullableText,
  read,
  requiredRecord,
  requiredText,
} from './json-read';

export function mapOptionalRichTextFragments<TKind extends string>(
  value: Json | undefined,
  field: string,
  requireKind: (value: string, field: string) => TKind,
): Array<RichTextFragment & { kind: TKind }> | null {
  return value === undefined || value === null
    ? null
    : mapRichTextFragments(value, field, requireKind);
}

export function mapRichTextFragments<TKind extends string>(
  value: Json | undefined,
  field: string,
  requireKind: (value: string, field: string) => TKind,
): Array<RichTextFragment & { kind: TKind }> {
  if (!Array.isArray(value)) {
    throw new Error(`${field} must be an array.`);
  }

  return value.map((entry, index) =>
    mapRichTextFragment(
      requiredRecord(entry, `${field}[${index}]`),
      `${field}[${index}]`,
      requireKind,
    ),
  );
}

export function requireRichTextTone(
  value: string,
  field: string,
): RichTextTone {
  if (
    value === 'heading' ||
    value === 'info' ||
    value === 'warn' ||
    value === 'success' ||
    value === 'danger' ||
    value === 'muted'
  ) {
    return value;
  }

  throw new Error(`${field} has unsupported value: ${value}.`);
}

function mapRichTextFragment<TKind extends string>(
  record: JsonRecord,
  field: string,
  requireKind: (value: string, field: string) => TKind,
): RichTextFragment & { kind: TKind } {
  return {
    kind: requireKind(requiredText(read(record, 'kind'), `${field}.kind`), `${field}.kind`),
    text: requiredText(read(record, 'text'), `${field}.text`),
    tone: mapOptionalTone(read(record, 'tone'), `${field}.tone`),
    token: optionalNullableText(read(record, 'token'), `${field}.token`) ?? undefined,
    value: optionalNullableNumber(read(record, 'value'), `${field}.value`) ?? undefined,
    displayValue: optionalNullableText(read(record, 'displayValue'), `${field}.displayValue`) ?? undefined,
    resourceKey: optionalNullableText(read(record, 'resourceKey'), `${field}.resourceKey`) ?? undefined,
    statKey: optionalNullableText(read(record, 'statKey'), `${field}.statKey`) ?? undefined,
    effectKey: optionalNullableText(read(record, 'effectKey'), `${field}.effectKey`) ?? undefined,
    effectKind: optionalNullableText(read(record, 'effectKind'), `${field}.effectKind`) ?? undefined,
    itemId: optionalNullableText(read(record, 'itemId'), `${field}.itemId`) ?? undefined,
    itemReferenceId: optionalNullableText(read(record, 'itemReferenceId'), `${field}.itemReferenceId`) ?? undefined,
    itemName: optionalNullableText(read(record, 'itemName'), `${field}.itemName`) ?? undefined,
    itemPublicToken: optionalNullableText(read(record, 'itemPublicToken'), `${field}.itemPublicToken`),
    metadata: mapMetadata(read(record, 'metadata'), `${field}.metadata`),
  };
}

function mapOptionalTone(
  value: Json | undefined,
  field: string,
): RichTextTone | undefined {
  return value === undefined || value === null
    ? undefined
    : requireRichTextTone(requiredText(value, field), field);
}

function mapMetadata(
  value: Json | undefined,
  field: string,
): Record<string, unknown> | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  return requiredRecord(value, field) as Record<string, unknown>;
}
