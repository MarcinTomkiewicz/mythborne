import {
  CombatReportDomainContext,
  ExplorationReportDomainContext,
  PrivateReportDetailPage,
  PublicReportDetailV2,
  PvpReportDomainContext,
  ReportContentKind,
  ReportAccessPrivate,
  ReportDomainKey,
  ReportDomainContextV1,
  ReportDomainFrontendUsage,
  ReportShellContextDate,
  ReportShellContextV1,
  ReportShellContextValue,
  ReportShellLegacySnapshot,
  SpyReportDomainContext,
} from '../domain/reports/report-detail.model';
import { Json } from '../types/database.types';
import {
  JsonRecord,
  read,
  requiredBoolean,
  requiredNullableBoolean,
  requiredNullableText,
  requiredRecord,
  requiredText,
} from './json-read';
import { mapReportDetailCore } from './report-detail-core.mapper';
import { mapOptionalPvpCombatContextPresentation } from './pvp-combat-context.mapper';
import { mapOptionalPvpResultSnapshot } from './pvp-result-snapshot.mapper';

export function mapReportDetailPage(
  value: Json,
  expected: { heroId: string; reportId: string },
): PrivateReportDetailPage {
  const root = requiredRecord(value, 'get_report_detail');

  return {
    contractVersion: requireReportDetailVersion(root),
    access: mapPrivateAccess(
      requiredRecord(read(root, 'access'), 'get_report_detail.access'),
      expected,
    ),
    reportShellContextJson: mapReportShellContext(
      requiredRecord(read(root, 'reportShellContextJson'), 'get_report_detail.reportShellContextJson'),
      'get_report_detail.reportShellContextJson',
    ),
    domainContextJson: mapReportDomainContext(
      requiredRecord(read(root, 'domainContextJson'), 'get_report_detail.domainContextJson'),
      'get_report_detail.domainContextJson',
    ),
    report: mapReportDetailCore(
      requiredRecord(read(root, 'report'), 'get_report_detail.report'),
    ),
  };
}

export function mapPublicReportDetailPage(value: Json): PublicReportDetailV2 {
  const root = requiredRecord(value, 'get_public_report_detail');
  const contractVersion = requireReportDetailVersion(root);
  const access = requiredRecord(read(root, 'access'), 'get_public_report_detail.access');
  const isAvailable = requiredBoolean(
    read(access, 'isAvailable'),
    'get_public_report_detail.access.isAvailable',
  );

  if (!isAvailable) {
    return {
      contractVersion,
      access: {
        visibility: requireVisibility(
          requiredText(read(access, 'visibility'), 'get_public_report_detail.access.visibility'),
          'public',
          'get_public_report_detail.access.visibility',
        ),
        isPublic: requireTrue(
          requiredBoolean(read(access, 'isPublic'), 'get_public_report_detail.access.isPublic'),
          'get_public_report_detail.access.isPublic',
        ),
        publicToken: requiredNullableText(
          read(access, 'publicToken'),
          'get_public_report_detail.access.publicToken',
        ),
        isAvailable,
        notFoundKey: requirePublicNotFoundKey(
          requiredText(read(access, 'notFoundKey'), 'get_public_report_detail.access.notFoundKey'),
        ),
        notFoundLabel: requiredText(
          read(access, 'notFoundLabel'),
          'get_public_report_detail.access.notFoundLabel',
        ),
      },
      reportShellContextJson: null,
      domainContextJson: null,
      report: null,
    };
  }

  return {
    contractVersion,
    access: {
      visibility: requireVisibility(
        requiredText(read(access, 'visibility'), 'get_public_report_detail.access.visibility'),
        'public',
        'get_public_report_detail.access.visibility',
      ),
      isPublic: requireTrue(
        requiredBoolean(read(access, 'isPublic'), 'get_public_report_detail.access.isPublic'),
        'get_public_report_detail.access.isPublic',
      ),
      publicToken: requiredText(
        read(access, 'publicToken'),
        'get_public_report_detail.access.publicToken',
      ),
      isAvailable,
    },
    reportShellContextJson: mapReportShellContext(
      requiredRecord(
        read(root, 'reportShellContextJson'),
        'get_public_report_detail.reportShellContextJson',
      ),
      'get_public_report_detail.reportShellContextJson',
    ),
    domainContextJson: mapReportDomainContext(
      requiredRecord(
        read(root, 'domainContextJson'),
        'get_public_report_detail.domainContextJson',
      ),
      'get_public_report_detail.domainContextJson',
    ),
    report: mapReportDetailCore(
      requiredRecord(read(root, 'report'), 'get_public_report_detail.report'),
    ),
  };
}

function mapReportShellContext(context: JsonRecord, field: string): ReportShellContextV1 {
  return {
    contractVersion: requireReportShellContextVersion(
      requiredText(read(context, 'contractVersion'), `${field}.contractVersion`),
    ),
    eyebrow: requiredText(read(context, 'eyebrow'), `${field}.eyebrow`),
    title: requiredText(read(context, 'title'), `${field}.title`),
    summary: requiredNullableText(read(context, 'summary'), `${field}.summary`),
    source: mapShellContextValue(
      requiredRecord(read(context, 'source'), `${field}.source`),
      `${field}.source`,
    ),
    eventType: mapShellContextValue(
      requiredRecord(read(context, 'eventType'), `${field}.eventType`),
      `${field}.eventType`,
    ),
    reportDate: mapShellContextDate(
      requiredRecord(read(context, 'reportDate'), `${field}.reportDate`),
      `${field}.reportDate`,
    ),
    legacyReportSnapshot: mapShellLegacySnapshot(
      requiredRecord(read(context, 'legacyReportSnapshot'), `${field}.legacyReportSnapshot`),
      `${field}.legacyReportSnapshot`,
    ),
    missingShellContextReason: requiredNullableText(
      read(context, 'missingShellContextReason'),
      `${field}.missingShellContextReason`,
    ),
  };
}

function mapShellContextValue(record: JsonRecord, field: string): ReportShellContextValue {
  return {
    key: requiredText(read(record, 'key'), `${field}.key`),
    label: requiredText(read(record, 'label'), `${field}.label`),
  };
}

function mapShellContextDate(record: JsonRecord, field: string): ReportShellContextDate {
  return {
    value: requiredNullableText(read(record, 'value'), `${field}.value`),
    displayValue: requiredNullableText(read(record, 'displayValue'), `${field}.displayValue`),
  };
}

function mapShellLegacySnapshot(record: JsonRecord, field: string): ReportShellLegacySnapshot {
  return {
    reportTypeKey: requiredNullableText(read(record, 'reportTypeKey'), `${field}.reportTypeKey`),
    sourceEntityType: requiredNullableText(
      read(record, 'sourceEntityType'),
      `${field}.sourceEntityType`,
    ),
    title: requiredNullableText(read(record, 'title'), `${field}.title`),
    summary: requiredNullableText(read(record, 'summary'), `${field}.summary`),
    hiddenFromShell: requireTrue(
      requiredBoolean(read(record, 'hiddenFromShell'), `${field}.hiddenFromShell`),
      `${field}.hiddenFromShell`,
    ),
  };
}

function requireReportDetailVersion(root: JsonRecord): 'report_detail_v2' {
  const version = requiredText(read(root, 'contractVersion'), 'report_detail.contractVersion');

  if (version !== 'report_detail_v2') {
    throw new Error(`report_detail has unsupported contract version: ${version}.`);
  }

  return version;
}

function mapPrivateAccess(
  access: JsonRecord,
  expected: { heroId: string; reportId: string },
): ReportAccessPrivate {
  const visibility = requiredText(read(access, 'visibility'), 'get_report_detail.access.visibility');
  const heroId = requiredText(read(access, 'heroId'), 'get_report_detail.access.heroId');
  const reportId = requiredText(read(access, 'reportId'), 'get_report_detail.access.reportId');

  if (heroId !== expected.heroId) {
    throw new Error('get_report_detail.access.heroId does not match requested heroId.');
  }

  if (reportId !== expected.reportId) {
    throw new Error('get_report_detail.access.reportId does not match requested reportId.');
  }

  return {
    visibility: requireVisibility(visibility, 'private', 'get_report_detail.access.visibility'),
    heroId,
    reportId,
    accessRole: requiredText(read(access, 'accessRole'), 'get_report_detail.access.accessRole'),
    isUnread: requiredBoolean(read(access, 'isUnread'), 'get_report_detail.access.isUnread'),
    readAt: requiredNullableText(read(access, 'readAt'), 'get_report_detail.access.readAt'),
  };
}

function mapReportDomainContext(context: JsonRecord, field: string): ReportDomainContextV1 {
  const contentKind = requireReportContentKind(
    requiredText(read(context, 'contentKind'), `${field}.contentKind`),
    `${field}.contentKind`,
  );
  const pvp = mapOptionalRecord(read(context, 'pvp'), `${field}.pvp`, mapPvpContext);
  const pvpResult = mapOptionalPvpResultSnapshot(read(context, 'pvpResult'), `${field}.pvpResult`);

  if (contentKind === 'pvp_combat' && pvp?.sourceKind === 'pvp_attack' && !pvpResult) {
    throw new Error(`${field}.pvpResult is required for PvP combat reports.`);
  }

  return {
    contractVersion: requireDomainContextVersion(
      requiredText(read(context, 'contractVersion'), `${field}.contractVersion`),
    ),
    reportDomainKey: requireReportDomainKey(
      requiredText(read(context, 'reportDomainKey'), `${field}.reportDomainKey`),
      `${field}.reportDomainKey`,
    ),
    contentKind,
    resultKind: requiredNullableText(read(context, 'resultKind'), `${field}.resultKind`),
    gameReportId: requiredNullableText(read(context, 'gameReportId'), `${field}.gameReportId`),
    publicToken: requiredNullableText(read(context, 'publicToken'), `${field}.publicToken`),
    reportTypeKey: requiredNullableText(read(context, 'reportTypeKey'), `${field}.reportTypeKey`),
    sourceEntityType: requiredNullableText(
      read(context, 'sourceEntityType'),
      `${field}.sourceEntityType`,
    ),
    sourceEntityId: requiredNullableText(read(context, 'sourceEntityId'), `${field}.sourceEntityId`),
    frontendUsage: mapFrontendUsage(
      requiredRecord(read(context, 'frontendUsage'), `${field}.frontendUsage`),
      `${field}.frontendUsage`,
    ),
    exploration: mapOptionalRecord(
      read(context, 'exploration'),
      `${field}.exploration`,
      mapExplorationContext,
    ),
    pvp,
    spy: mapOptionalRecord(read(context, 'spy'), `${field}.spy`, mapSpyContext),
    combat: mapOptionalRecord(read(context, 'combat'), `${field}.combat`, mapCombatContext),
    pvpCombatContext: mapOptionalPvpCombatContextPresentation(
      read(context, 'pvpCombatContext'),
      `${field}.pvpCombatContext`,
    ),
    pvpResult,
    missingContextReason: requiredNullableText(
      read(context, 'missingContextReason'),
      `${field}.missingContextReason`,
    ),
  };
}

function mapFrontendUsage(usage: JsonRecord, field: string): ReportDomainFrontendUsage {
  return {
    contentAccessMode: requireContentAccessMode(
      requiredText(read(usage, 'contentAccessMode'), `${field}.contentAccessMode`),
      `${field}.contentAccessMode`,
    ),
    canUsePrivateDomainReads: requiredBoolean(
      read(usage, 'canUsePrivateDomainReads'),
      `${field}.canUsePrivateDomainReads`,
    ),
    shouldRenderFromReportSnapshot: requiredBoolean(
      read(usage, 'shouldRenderFromReportSnapshot'),
      `${field}.shouldRenderFromReportSnapshot`,
    ),
    sourceIdsRedacted: requiredBoolean(
      read(usage, 'sourceIdsRedacted'),
      `${field}.sourceIdsRedacted`,
    ),
  };
}

function mapExplorationContext(
  record: JsonRecord,
  field: string,
): ExplorationReportDomainContext {
  return {
    explorationId: requiredNullableText(read(record, 'explorationId'), `${field}.explorationId`),
    challengeAttemptId: requiredNullableText(
      read(record, 'challengeAttemptId'),
      `${field}.challengeAttemptId`,
    ),
    stepId: requiredNullableText(read(record, 'stepId'), `${field}.stepId`),
    combatResultId: requiredNullableText(read(record, 'combatResultId'), `${field}.combatResultId`),
    rewardSourceKind: requireRewardSourceKind(
      requiredNullableText(read(record, 'rewardSourceKind'), `${field}.rewardSourceKind`),
      `${field}.rewardSourceKind`,
    ),
    challengeKind: requiredNullableText(read(record, 'challengeKind'), `${field}.challengeKind`),
    challengeStatus: requiredNullableText(
      read(record, 'challengeStatus'),
      `${field}.challengeStatus`,
    ),
    challengeSuccess: requiredNullableBoolean(
      read(record, 'challengeSuccess'),
      `${field}.challengeSuccess`,
    ),
    completionMode: requiredNullableText(read(record, 'completionMode'), `${field}.completionMode`),
    stepOutcomeKind: requiredNullableText(read(record, 'stepOutcomeKind'), `${field}.stepOutcomeKind`),
  };
}

function mapPvpContext(record: JsonRecord, field: string): PvpReportDomainContext {
  return {
    pvpActionId: requiredNullableText(read(record, 'pvpActionId'), `${field}.pvpActionId`),
    pvpAttackResultId: requiredNullableText(
      read(record, 'pvpAttackResultId'),
      `${field}.pvpAttackResultId`,
    ),
    combatResultId: requiredNullableText(read(record, 'combatResultId'), `${field}.combatResultId`),
    sourceKind: requirePvpSourceKind(
      requiredNullableText(read(record, 'sourceKind'), `${field}.sourceKind`),
      `${field}.sourceKind`,
    ),
    outcomeKey: requiredNullableText(read(record, 'outcomeKey'), `${field}.outcomeKey`),
  };
}

function mapSpyContext(record: JsonRecord, field: string): SpyReportDomainContext {
  return {
    pvpSpyResultId: requiredNullableText(read(record, 'pvpSpyResultId'), `${field}.pvpSpyResultId`),
    pvpActionId: requiredNullableText(read(record, 'pvpActionId'), `${field}.pvpActionId`),
    outcomeKey: requiredNullableText(read(record, 'outcomeKey'), `${field}.outcomeKey`),
    success: requiredNullableBoolean(read(record, 'success'), `${field}.success`),
    detected: requiredNullableBoolean(read(record, 'detected'), `${field}.detected`),
  };
}

function mapCombatContext(record: JsonRecord, field: string): CombatReportDomainContext {
  return {
    combatResultId: requiredNullableText(read(record, 'combatResultId'), `${field}.combatResultId`),
    sourceType: requiredNullableText(read(record, 'sourceType'), `${field}.sourceType`),
    sourceEntityId: requiredNullableText(read(record, 'sourceEntityId'), `${field}.sourceEntityId`),
    parentReportId: requiredNullableText(read(record, 'parentReportId'), `${field}.parentReportId`),
    parentPublicToken: requiredNullableText(
      read(record, 'parentPublicToken'),
      `${field}.parentPublicToken`,
    ),
    isChildCombatReport: requiredBoolean(read(record, 'isChildCombatReport'), `${field}.isChildCombatReport`),
  };
}

function mapOptionalRecord<T>(
  value: Json | undefined,
  field: string,
  mapper: (record: JsonRecord, field: string) => T,
): T | null {
  if (value === null || value === undefined) {
    return null;
  }

  return mapper(requiredRecord(value, field), field);
}

function requireVisibility<T extends 'private' | 'public'>(
  value: string,
  expected: T,
  field: string,
): T {
  if (value !== expected) {
    throw new Error(`${field} must be ${expected}.`);
  }

  return expected;
}

function requirePublicNotFoundKey(value: string): 'public_report_not_found' {
  if (value !== 'public_report_not_found') {
    throw new Error('get_public_report_detail.access.notFoundKey must be public_report_not_found.');
  }

  return value;
}

function requireTrue(value: boolean, field: string): true {
  if (value !== true) {
    throw new Error(`${field} must be true.`);
  }

  return true;
}

function requireReportDomainKey(value: string, field: string): ReportDomainKey {
  if (
    value === 'exploration' ||
    value === 'pvp' ||
    value === 'spy' ||
    value === 'combat' ||
    value === 'trade' ||
    value === 'auction' ||
    value === 'siege' ||
    value === 'argonautics' ||
    value === 'unknown'
  ) {
    return value;
  }

  throw new Error(`${field} has unsupported value: ${value}.`);
}

function requireReportContentKind(value: string, field: string): ReportContentKind {
  if (
    value === 'exploration_trial' ||
    value === 'exploration_encounter' ||
    value === 'exploration_combat_encounter' ||
    value === 'exploration_challenge' ||
    value === 'exploration_step' ||
    value === 'pvp_combat' ||
    value === 'pvp_spy' ||
    value === 'combat' ||
    value === 'trade' ||
    value === 'auction' ||
    value === 'siege' ||
    value === 'argonautics' ||
    value === 'unknown'
  ) {
    return value;
  }

  throw new Error(`${field} has unsupported value: ${value}.`);
}

function requireDomainContextVersion(value: string): 'report_domain_context_v1' {
  if (value !== 'report_domain_context_v1') {
    throw new Error(`report domain context has unsupported contract version: ${value}.`);
  }

  return value;
}

function requireReportShellContextVersion(value: string): 'report_shell_context_v1' {
  if (value !== 'report_shell_context_v1') {
    throw new Error(`report shell context has unsupported contract version: ${value}.`);
  }

  return value;
}

function requireContentAccessMode(
  value: string,
  field: string,
): ReportDomainFrontendUsage['contentAccessMode'] {
  if (value !== 'private_source_context' && value !== 'report_snapshot_only') {
    throw new Error(`${field} has unsupported value: ${value}.`);
  }

  return value;
}

function requireRewardSourceKind(
  value: string | null,
  field: string,
): ExplorationReportDomainContext['rewardSourceKind'] {
  if (value === null || value === 'challenge_attempt' || value === 'step') {
    return value;
  }

  throw new Error(`${field} has unsupported value: ${value}.`);
}

function requirePvpSourceKind(
  value: string | null,
  field: string,
): PvpReportDomainContext['sourceKind'] {
  if (value === null || value === 'pvp_attack' || value === 'pvp_spy') {
    return value;
  }

  throw new Error(`${field} has unsupported value: ${value}.`);
}
