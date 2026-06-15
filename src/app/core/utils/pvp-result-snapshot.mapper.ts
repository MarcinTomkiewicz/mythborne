import {
  PvpResultGlorySentence,
  PvpResultOutcomeBannerTone,
  PvpResultOutcomeBanner,
  PvpResultOutcomeKey,
  PvpResultPerspective,
  PvpResultSnapshot,
  PvpResultSummary,
  PvpResultTechnicalContext,
} from '../domain/pvp/pvp-result-snapshot.model';
import { Json } from '../types/database.types';
import {
  JsonRecord,
  read,
  requireFalse,
  requireLiteral,
  requireNull,
  requiredRecord,
  requiredText,
  requiredBoolean,
} from './json-read';
import { mapRichTextFragments } from './rich-text.mapper';

export function mapOptionalPvpResultSnapshot(
  value: Json | undefined,
  field: string,
): PvpResultSnapshot | null {
  if (value === undefined || value === null) {
    return null;
  }

  const record = requiredRecord(value, field);
  requireLiteral(requiredText(read(record, 'contractKey'), `${field}.contractKey`), 'pvp_result_snapshot', `${field}.contractKey`);
  requireLiteral(requiredText(read(record, 'contractVersion'), `${field}.contractVersion`), 'pvp_result_snapshot_v1', `${field}.contractVersion`);
  requireLiteral(requiredText(read(record, 'sourceOwner'), `${field}.sourceOwner`), 'pvp.result', `${field}.sourceOwner`);

  return {
    contractKey: 'pvp_result_snapshot',
    contractVersion: 'pvp_result_snapshot_v1',
    sourceOwner: 'pvp.result',
    private: {
      attacker: mapPvpResultSummary(
        requiredRecord(read(requiredRecord(read(record, 'private'), `${field}.private`), 'attacker'), `${field}.private.attacker`),
        `${field}.private.attacker`,
      ),
      defender: mapPvpResultSummary(
        requiredRecord(read(requiredRecord(read(record, 'private'), `${field}.private`), 'defender'), `${field}.private.defender`),
        `${field}.private.defender`,
      ),
    },
    public: mapPublicSummaries(
      requiredRecord(read(record, 'public'), `${field}.public`),
      `${field}.public`,
    ),
  };
}

function mapPublicSummaries(record: JsonRecord, field: string): PvpResultSnapshot['public'] {
  return {
    neutral: mapPvpResultSummary(
      requiredRecord(read(record, 'neutral'), `${field}.neutral`),
      `${field}.neutral`,
    ),
    includesGlory: requireFalse(read(record, 'includesGlory'), `${field}.includesGlory`),
    glory: requireNull(read(record, 'glory'), `${field}.glory`),
  };
}

function mapPvpResultSummary(record: JsonRecord, field: string): PvpResultSummary {
  requireLiteral(requiredText(read(record, 'contractKey'), `${field}.contractKey`), 'pvp_result_summary', `${field}.contractKey`);
  requireLiteral(requiredText(read(record, 'contractVersion'), `${field}.contractVersion`), 'pvp_result_summary_v1', `${field}.contractVersion`);
  requireLiteral(requiredText(read(record, 'sourceOwner'), `${field}.sourceOwner`), 'pvp.result', `${field}.sourceOwner`);

  return {
    contractKey: 'pvp_result_summary',
    contractVersion: 'pvp_result_summary_v1',
    sourceOwner: 'pvp.result',
    locale: requireLiteral(requiredText(read(record, 'locale'), `${field}.locale`), 'pl', `${field}.locale`),
    outcomeKey: requireOutcomeKey(requiredText(read(record, 'outcomeKey'), `${field}.outcomeKey`), `${field}.outcomeKey`),
    perspective: requirePerspective(requiredText(read(record, 'perspective'), `${field}.perspective`), `${field}.perspective`),
    title: requiredText(read(record, 'title'), `${field}.title`),
    summaryPlainText: requiredText(read(record, 'summaryPlainText'), `${field}.summaryPlainText`),
    summaryRichText: mapRichTextFragments(
      read(record, 'summaryRichText'),
      `${field}.summaryRichText`,
      requireTextOrValueKind,
    ),
    outcomeBanner: mapOutcomeBanner(
      requiredRecord(read(record, 'outcomeBanner'), `${field}.outcomeBanner`),
      `${field}.outcomeBanner`,
    ),
    includesGlory: requiredBoolean(read(record, 'includesGlory'), `${field}.includesGlory`),
    glorySentence: mapOptionalGlorySentence(read(record, 'glorySentence'), `${field}.glorySentence`),
    technicalContext: mapTechnicalContext(
      requiredRecord(read(record, 'technicalContext'), `${field}.technicalContext`),
      `${field}.technicalContext`,
    ),
  };
}

function mapOutcomeBanner(record: JsonRecord, field: string): PvpResultOutcomeBanner {
  requireLiteral(requiredText(read(record, 'contractKey'), `${field}.contractKey`), 'pvp_result_outcome_banner', `${field}.contractKey`);
  requireLiteral(requiredText(read(record, 'contractVersion'), `${field}.contractVersion`), 'pvp_result_outcome_banner_v1', `${field}.contractVersion`);
  requireLiteral(requiredText(read(record, 'sourceOwner'), `${field}.sourceOwner`), 'pvp.result', `${field}.sourceOwner`);

  return {
    contractKey: 'pvp_result_outcome_banner',
    contractVersion: 'pvp_result_outcome_banner_v1',
    sourceOwner: 'pvp.result',
    perspective: requirePerspective(requiredText(read(record, 'perspective'), `${field}.perspective`), `${field}.perspective`),
    outcomeKey: requireOutcomeKey(requiredText(read(record, 'outcomeKey'), `${field}.outcomeKey`), `${field}.outcomeKey`),
    label: requiredNonBlankText(read(record, 'label'), `${field}.label`),
    statusLabel: requiredString(read(record, 'statusLabel'), `${field}.statusLabel`),
    title: requiredNonBlankText(read(record, 'title'), `${field}.title`),
    description: requiredString(read(record, 'description'), `${field}.description`),
    tone: requireOutcomeBannerTone(requiredText(read(record, 'tone'), `${field}.tone`), `${field}.tone`),
    iconKey: requiredNonBlankText(read(record, 'iconKey'), `${field}.iconKey`),
  };
}

function requiredNonBlankText(value: Json | undefined, field: string): string {
  const text = requiredText(value, field);

  if (!text.trim()) {
    throw new Error(`${field} must be a non-empty string.`);
  }

  return text;
}

function requiredString(value: Json | undefined, field: string): string {
  if (typeof value === 'string') {
    return value;
  }

  throw new Error(`${field} must be a string.`);
}

function mapOptionalGlorySentence(
  value: Json | undefined,
  field: string,
): PvpResultGlorySentence | null {
  if (value === undefined || value === null) {
    return null;
  }

  const record = requiredRecord(value, field);
  requireLiteral(requiredText(read(record, 'contractKey'), `${field}.contractKey`), 'pvp_result_glory_sentence', `${field}.contractKey`);
  requireLiteral(requiredText(read(record, 'contractVersion'), `${field}.contractVersion`), 'pvp_result_glory_sentence_v1', `${field}.contractVersion`);

  return {
    contractKey: 'pvp_result_glory_sentence',
    contractVersion: 'pvp_result_glory_sentence_v1',
    messageKind: requiredText(read(record, 'messageKind'), `${field}.messageKind`),
    plainText: requiredText(read(record, 'plainText'), `${field}.plainText`),
    richText: mapRichTextFragments(read(record, 'richText'), `${field}.richText`, requireTextOrValueKind),
  };
}

function mapTechnicalContext(record: JsonRecord, field: string): PvpResultTechnicalContext {
  return {
    pvpAttackResultId: requiredText(read(record, 'pvpAttackResultId'), `${field}.pvpAttackResultId`),
    combatResultId: requiredText(read(record, 'combatResultId'), `${field}.combatResultId`),
    attackerHeroId: requiredText(read(record, 'attackerHeroId'), `${field}.attackerHeroId`),
    defenderHeroId: requiredText(read(record, 'defenderHeroId'), `${field}.defenderHeroId`),
  };
}

function requireOutcomeKey(value: string, field: string): PvpResultOutcomeKey {
  if (value === 'attacker_victory' || value === 'defender_victory' || value === 'draw') {
    return value;
  }

  throw new Error(`${field} has unsupported value: ${value}.`);
}

function requirePerspective(value: string, field: string): PvpResultPerspective {
  if (value === 'attacker' || value === 'defender' || value === 'neutral') {
    return value;
  }

  throw new Error(`${field} has unsupported value: ${value}.`);
}

function requireOutcomeBannerTone(
  value: string,
  field: string,
): PvpResultOutcomeBannerTone {
  if (
    value === 'success' ||
    value === 'danger' ||
    value === 'warning' ||
    value === 'neutral'
  ) {
    return value;
  }

  throw new Error(`${field} has unsupported value: ${value}.`);
}

function requireTextOrValueKind(value: string, field: string): 'text' | 'value' {
  if (value === 'text' || value === 'value') {
    return value;
  }

  throw new Error(`${field} has unsupported value: ${value}.`);
}
