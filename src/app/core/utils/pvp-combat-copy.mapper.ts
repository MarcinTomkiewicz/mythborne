import {
  PvpCombatContextCopy,
  PvpCombatCopy,
  PvpCombatCopyLocale,
  PvpCombatParticipantEffectSourceKey,
  PvpCombatParticipantEffectTemplateCopy,
  PvpCombatParticipantEffectTemplatesCopy,
  PvpCombatSourcePresentationCopy,
  PvpCombatWorkflowCopy,
} from '../domain/pvp/pvp-combat-copy.model';
import { RichTextTone } from '../domain/rich-text/rich-text.model';
import { Json } from '../types/database.types';
import {
  JsonRecord,
  optionalNullableNumber,
  optionalNullableText,
  optionalTextArray,
  read,
  requireLiteral,
  requiredRecord,
  requiredText,
} from './json-read';
import {
  mapRichTextFragments,
  requireRichTextTone,
} from './rich-text.mapper';
import { copyTextOrKey } from './game-copy-key-fallback';

const PVP_COMBAT_LOCALES: readonly PvpCombatCopyLocale[] = ['pl', 'en'];
const EFFECT_SOURCE_KEYS: readonly PvpCombatParticipantEffectSourceKey[] = [
  'barracks',
  'fortress',
  'blessing',
  'curse',
];

export function mapPvpCombatCopy(raw: Json): PvpCombatCopy {
  const root = requiredRecord(raw, 'get_pvp_combat_copy');

  requireLiteral(
    requiredText(read(root, 'contractKey'), 'get_pvp_combat_copy.contractKey'),
    'pvp_combat_copy',
    'get_pvp_combat_copy.contractKey',
  );
  requireLiteral(
    requiredText(read(root, 'contractVersion'), 'get_pvp_combat_copy.contractVersion'),
    'pvp_combat_copy_v2',
    'get_pvp_combat_copy.contractVersion',
  );

  return {
    contractKey: 'pvp_combat_copy',
    contractVersion: 'pvp_combat_copy_v2',
    requestedLocale: requiredText(read(root, 'requestedLocale'), 'get_pvp_combat_copy.requestedLocale'),
    locale: requireLocale(requiredText(read(root, 'locale'), 'get_pvp_combat_copy.locale')),
    fallbackLocale: requiredText(read(root, 'fallbackLocale'), 'get_pvp_combat_copy.fallbackLocale'),
    sourcePresentation: mapSourcePresentation(
      requiredRecord(read(root, 'sourcePresentation'), 'get_pvp_combat_copy.sourcePresentation'),
    ),
    context: mapContext(requiredRecord(read(root, 'context'), 'get_pvp_combat_copy.context')),
  };
}

function mapSourcePresentation(record: JsonRecord): PvpCombatSourcePresentationCopy {
  requireLiteral(
    requiredText(read(record, 'contractKey'), 'get_pvp_combat_copy.sourcePresentation.contractKey'),
    'pvp_combat_source_presentation',
    'get_pvp_combat_copy.sourcePresentation.contractKey',
  );
  requireLiteral(
    requiredText(read(record, 'contractVersion'), 'get_pvp_combat_copy.sourcePresentation.contractVersion'),
    'pvp_combat_source_presentation_v1',
    'get_pvp_combat_copy.sourcePresentation.contractVersion',
  );

  return {
    contractKey: 'pvp_combat_source_presentation',
    contractVersion: 'pvp_combat_source_presentation_v1',
    header: mapHeader(
      requiredRecord(read(record, 'header'), 'get_pvp_combat_copy.sourcePresentation.header'),
    ),
    live: mapLive(requiredRecord(read(record, 'live'), 'get_pvp_combat_copy.sourcePresentation.live')),
    emptyLog: mapMessage(
      requiredRecord(read(record, 'emptyLog'), 'get_pvp_combat_copy.sourcePresentation.emptyLog'),
      'pvp.combat.sourcePresentation.emptyLog',
    ),
    workflow: mapOptionalWorkflow(
      read(record, 'workflow'),
      'get_pvp_combat_copy.sourcePresentation.workflow',
    ),
  };
}

function mapHeader(record: JsonRecord): PvpCombatSourcePresentationCopy['header'] {
  return {
    eyebrow: copyTextOrKey(read(record, 'eyebrow'), 'pvp.combat.sourcePresentation.header.eyebrow'),
    title: copyTextOrKey(read(record, 'title'), 'pvp.combat.sourcePresentation.header.title'),
    text: copyTextOrKey(read(record, 'text'), 'pvp.combat.sourcePresentation.header.text'),
  };
}

function mapLive(record: JsonRecord): PvpCombatSourcePresentationCopy['live'] {
  return {
    title: copyTextOrKey(read(record, 'title'), 'pvp.combat.sourcePresentation.live.title'),
    text: copyTextOrKey(read(record, 'text'), 'pvp.combat.sourcePresentation.live.text'),
    helperText: copyTextOrKey(
      read(record, 'helperText'),
      'pvp.combat.sourcePresentation.live.helperText',
    ),
  };
}

function mapWorkflow(record: JsonRecord): PvpCombatWorkflowCopy {
  return {
    finalizingResult: mapMessage(
      requiredRecord(
        read(record, 'finalizingResult'),
        'get_pvp_combat_copy.sourcePresentation.workflow.finalizingResult',
      ),
      'pvp.combat.sourcePresentation.workflow.finalizingResult',
    ),
    finalizeUnavailable: mapMessage(
      requiredRecord(
        read(record, 'finalizeUnavailable'),
        'get_pvp_combat_copy.sourcePresentation.workflow.finalizeUnavailable',
      ),
      'pvp.combat.sourcePresentation.workflow.finalizeUnavailable',
    ),
    actionUnavailable: mapMessage(
      requiredRecord(
        read(record, 'actionUnavailable'),
        'get_pvp_combat_copy.sourcePresentation.workflow.actionUnavailable',
      ),
      'pvp.combat.sourcePresentation.workflow.actionUnavailable',
    ),
  };
}

function mapOptionalWorkflow(value: Json | undefined, field: string): PvpCombatWorkflowCopy | null {
  if (value === undefined || value === null) {
    return null;
  }

  return mapWorkflow(requiredRecord(value, field));
}

function mapMessage(record: JsonRecord, field: string): PvpCombatWorkflowCopy['finalizingResult'] {
  return {
    title: copyTextOrKey(read(record, 'title'), `${field}.title`),
    text: copyTextOrKey(read(record, 'text'), `${field}.text`),
  };
}

function mapContext(record: JsonRecord): PvpCombatContextCopy {
  return {
    contractKey: optionalNullableText(read(record, 'contractKey'), 'get_pvp_combat_copy.context.contractKey'),
    contractVersion: optionalNullableText(
      read(record, 'contractVersion'),
      'get_pvp_combat_copy.context.contractVersion',
    ),
    emptyLabel: optionalNullableText(read(record, 'emptyLabel'), 'get_pvp_combat_copy.context.emptyLabel'),
    participantEffectTemplates: mapParticipantEffectTemplates(
      requiredRecord(
        read(record, 'participantEffectTemplates'),
        'get_pvp_combat_copy.context.participantEffectTemplates',
      ),
    ),
  };
}

function mapParticipantEffectTemplates(
  record: JsonRecord,
): PvpCombatParticipantEffectTemplatesCopy {
  return {
    attackerBarracksHealth: mapParticipantEffectTemplate(
      requiredRecord(
        read(record, 'attackerBarracksHealth'),
        'get_pvp_combat_copy.context.participantEffectTemplates.attackerBarracksHealth',
      ),
      'get_pvp_combat_copy.context.participantEffectTemplates.attackerBarracksHealth',
    ),
    defenderFortressHealth: mapParticipantEffectTemplate(
      requiredRecord(
        read(record, 'defenderFortressHealth'),
        'get_pvp_combat_copy.context.participantEffectTemplates.defenderFortressHealth',
      ),
      'get_pvp_combat_copy.context.participantEffectTemplates.defenderFortressHealth',
    ),
    blessing: mapParticipantEffectTemplate(
      requiredRecord(
        read(record, 'blessing'),
        'get_pvp_combat_copy.context.participantEffectTemplates.blessing',
      ),
      'get_pvp_combat_copy.context.participantEffectTemplates.blessing',
    ),
    curse: mapParticipantEffectTemplate(
      requiredRecord(
        read(record, 'curse'),
        'get_pvp_combat_copy.context.participantEffectTemplates.curse',
      ),
      'get_pvp_combat_copy.context.participantEffectTemplates.curse',
    ),
  };
}

function mapParticipantEffectTemplate(
  record: JsonRecord,
  field: string,
): PvpCombatParticipantEffectTemplateCopy {
  return {
    key: copyTextOrKey(read(record, 'key'), `${field}.key`),
    participantRole: copyTextOrKey(read(record, 'participantRole'), `${field}.participantRole`),
    sourceKey: requireEffectSourceKey(
      requiredText(read(record, 'sourceKey'), `${field}.sourceKey`),
      `${field}.sourceKey`,
    ),
    summaryPlainTemplate: copyTextOrKey(
      read(record, 'summaryPlainTemplate'),
      `${field}.summaryPlainTemplate`,
    ),
    summaryRichTextTemplate: mapRichTextFragments(
      read(record, 'summaryRichTextTemplate'),
      `${field}.summaryRichTextTemplate`,
      requireTextOrValueKind,
    ),
    valueDisplay: optionalNullableText(read(record, 'valueDisplay'), `${field}.valueDisplay`),
    requiredPlaceholders: optionalTextArray(
      read(record, 'requiredPlaceholders'),
      `${field}.requiredPlaceholders`,
    ),
    tone: optionalRichTextTone(read(record, 'tone'), `${field}.tone`),
    sortOrder: optionalNullableNumber(read(record, 'sortOrder'), `${field}.sortOrder`),
  };
}

function requireLocale(value: string): PvpCombatCopyLocale {
  if (PVP_COMBAT_LOCALES.includes(value as PvpCombatCopyLocale)) {
    return value as PvpCombatCopyLocale;
  }

  throw new Error(`get_pvp_combat_copy.locale has unsupported value: ${value}.`);
}

function requireEffectSourceKey(value: string, field: string): PvpCombatParticipantEffectSourceKey {
  if (EFFECT_SOURCE_KEYS.includes(value as PvpCombatParticipantEffectSourceKey)) {
    return value as PvpCombatParticipantEffectSourceKey;
  }

  throw new Error(`${field} has unsupported value: ${value}.`);
}

function requireTextOrValueKind(value: string, field: string): 'text' | 'value' {
  if (value === 'text' || value === 'value') {
    return value;
  }

  throw new Error(`${field} has unsupported value: ${value}.`);
}

function optionalRichTextTone(value: Json | undefined, field: string): RichTextTone | null {
  if (value === undefined || value === null) {
    return null;
  }

  return requireRichTextTone(requiredText(value, field), field);
}
