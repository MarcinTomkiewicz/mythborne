import {
  PvpRankingCommonCopy,
  PvpRankingCopy,
  PvpRankingDisabledReasonKey,
  PvpRankingDistrictKey,
  PVP_RANKING_DISABLED_REASON_KEYS,
} from '../domain/pvp/pvp-ranking.model';
import { Json } from '../types/database.types';
import {
  JsonRecord,
  read,
  requiredRecord,
  requiredText,
} from './json-read';

const COPY_CONTRACT_KEY = 'pvp_ranking_copy';

export function mapPvpRankingCopy(value: Json): PvpRankingCopy {
  const root = requiredRecord(value, 'get_pvp_ranking_copy');
  const contractKey = requiredText(read(root, 'contractKey'), 'pvpRankingCopy.contractKey');

  if (contractKey !== COPY_CONTRACT_KEY) {
    throw new Error(`pvpRankingCopy.contractKey must be ${COPY_CONTRACT_KEY}.`);
  }

  const common = mapCommonCopy(requiredRecord(read(root, 'common'), 'pvpRankingCopy.common'));

  return {
    contractKey,
    requestedLocale: requiredText(read(root, 'requestedLocale'), 'pvpRankingCopy.requestedLocale'),
    locale: requiredLocale(read(root, 'locale'), 'pvpRankingCopy.locale'),
    fallbackLocale: requiredFallbackLocale(read(root, 'fallbackLocale'), 'pvpRankingCopy.fallbackLocale'),
    common,
    header: {
      eyebrow: requiredPathText(root, 'header', 'eyebrow'),
      title: requiredPathText(root, 'header', 'title'),
      intro: requiredPathText(root, 'header', 'intro'),
    },
    playerStatus: {
      labels: {
        dailyAttackLimit: requiredPathText(root, 'playerStatus', 'labels', 'dailyAttackLimit'),
        rankingPosition: requiredPathText(root, 'playerStatus', 'labels', 'rankingPosition'),
        attackProtection: requiredPathText(root, 'playerStatus', 'labels', 'attackProtection'),
        siegeProtection: requiredPathText(root, 'playerStatus', 'labels', 'siegeProtection'),
      },
      emptyValueKeys: {
        attackProtection: requiredEmptyValueKey(root, common, 'playerStatus', 'emptyValueKeys', 'attackProtection'),
        siegeProtection: requiredEmptyValueKey(root, common, 'playerStatus', 'emptyValueKeys', 'siegeProtection'),
        generic: requiredEmptyValueKey(root, common, 'playerStatus', 'emptyValueKeys', 'generic'),
      },
    },
    ranking: {
      title: requiredPathText(root, 'ranking', 'title'),
      description: requiredPathText(root, 'ranking', 'description'),
    },
    filters: {
      districtLabel: requiredPathText(root, 'filters', 'districtLabel'),
      districtOptions: mapDistrictOptionCopy(requiredRecord(
        read(requiredRecord(read(root, 'filters'), 'pvpRankingCopy.filters'), 'districtOptions'),
        'pvpRankingCopy.filters.districtOptions',
      )),
      searchLabel: requiredPathText(root, 'filters', 'searchLabel'),
      searchPlaceholder: requiredPathText(root, 'filters', 'searchPlaceholder'),
      searchAction: requiredPathText(root, 'filters', 'searchAction'),
      myPositionAction: requiredPathText(root, 'filters', 'myPositionAction'),
    },
    table: {
      columns: {
        rankPosition: requiredPathText(root, 'table', 'columns', 'rankPosition'),
        hero: requiredPathText(root, 'table', 'columns', 'hero'),
        level: requiredPathText(root, 'table', 'columns', 'level'),
        address: requiredPathText(root, 'table', 'columns', 'address'),
        attackDuration: requiredPathText(root, 'table', 'columns', 'attackDuration'),
        spyDuration: requiredPathText(root, 'table', 'columns', 'spyDuration'),
        actions: requiredPathText(root, 'table', 'columns', 'actions'),
      },
      emptyValueKeys: {
        noGuild: requiredEmptyValueKey(root, common, 'table', 'emptyValueKeys', 'noGuild'),
        noValue: requiredEmptyValueKey(root, common, 'table', 'emptyValueKeys', 'noValue'),
      },
      emptyState: {
        title: requiredPathText(root, 'table', 'emptyState', 'title'),
        text: requiredPathText(root, 'table', 'emptyState', 'text'),
      },
    },
    targetPanel: {
      labels: {
        target: requiredPathText(root, 'targetPanel', 'labels', 'target'),
        guild: requiredPathText(root, 'targetPanel', 'labels', 'guild'),
        address: requiredPathText(root, 'targetPanel', 'labels', 'address'),
        attackDuration: requiredPathText(root, 'targetPanel', 'labels', 'attackDuration'),
        spyDuration: requiredPathText(root, 'targetPanel', 'labels', 'spyDuration'),
        protection: requiredPathText(root, 'targetPanel', 'labels', 'protection'),
      },
      emptyValueKeys: {
        guild: requiredEmptyValueKey(root, common, 'targetPanel', 'emptyValueKeys', 'guild'),
        protection: requiredEmptyValueKey(root, common, 'targetPanel', 'emptyValueKeys', 'protection'),
        generic: requiredEmptyValueKey(root, common, 'targetPanel', 'emptyValueKeys', 'generic'),
      },
      emptyState: {
        title: requiredPathText(root, 'targetPanel', 'emptyState', 'title'),
        text: requiredPathText(root, 'targetPanel', 'emptyState', 'text'),
      },
    },
    actions: {
      spy: {
        label: requiredPathText(root, 'actions', 'spy', 'label'),
        tooltip: requiredPathText(root, 'actions', 'spy', 'tooltip'),
      },
      attack: {
        label: requiredPathText(root, 'actions', 'attack', 'label'),
        tooltip: requiredPathText(root, 'actions', 'attack', 'tooltip'),
      },
      siege: {
        label: requiredPathText(root, 'actions', 'siege', 'label'),
        tooltip: requiredPathText(root, 'actions', 'siege', 'tooltip'),
        disabledTooltip: requiredPathText(root, 'actions', 'siege', 'disabledTooltip'),
      },
    },
    disabledReasonTooltips: mapDisabledReasonTooltips(
      requiredRecord(read(root, 'disabledReasonTooltips'), 'pvpRankingCopy.disabledReasonTooltips'),
    ),
    feedback: {
      searchFailed: {
        summary: requiredPathText(root, 'feedback', 'searchFailed', 'summary'),
        detail: requiredPathText(root, 'feedback', 'searchFailed', 'detail'),
      },
      targetUnavailable: {
        summary: requiredPathText(root, 'feedback', 'targetUnavailable', 'summary'),
        detail: requiredPathText(root, 'feedback', 'targetUnavailable', 'detail'),
      },
    },
  };
}

function mapCommonCopy(root: JsonRecord): PvpRankingCommonCopy {
  return {
    emptyValues: {
      noAttackProtection: requiredPathText(root, 'emptyValues', 'noAttackProtection'),
      noData: requiredPathText(root, 'emptyValues', 'noData'),
      noGuild: requiredPathText(root, 'emptyValues', 'noGuild'),
      noValue: requiredPathText(root, 'emptyValues', 'noValue'),
    },
  };
}

function mapDistrictOptionCopy(root: JsonRecord): Record<PvpRankingDistrictKey, string> {
  return {
    A: requiredText(read(root, 'A'), 'pvpRankingCopy.filters.districtOptions.A'),
    B: requiredText(read(root, 'B'), 'pvpRankingCopy.filters.districtOptions.B'),
    C: requiredText(read(root, 'C'), 'pvpRankingCopy.filters.districtOptions.C'),
    D: requiredText(read(root, 'D'), 'pvpRankingCopy.filters.districtOptions.D'),
    E: requiredText(read(root, 'E'), 'pvpRankingCopy.filters.districtOptions.E'),
  };
}

function mapDisabledReasonTooltips(root: JsonRecord): Record<PvpRankingDisabledReasonKey, string> {
  return Object.fromEntries(PVP_RANKING_DISABLED_REASON_KEYS.map((key) => [
    key,
    requiredText(read(root, key), `pvpRankingCopy.disabledReasonTooltips.${key}`),
  ])) as Record<PvpRankingDisabledReasonKey, string>;
}

function requiredPathText(root: JsonRecord, ...path: string[]): string {
  const fieldPath = `pvpRankingCopy.${path.join('.')}`;
  const value = path.reduce<Json | undefined>((current, key) =>
    read(requiredRecord(current, fieldPath), key), root);

  return requiredText(value, fieldPath);
}

function requiredEmptyValueKey(
  root: JsonRecord,
  common: PvpRankingCommonCopy,
  ...path: string[]
): keyof PvpRankingCommonCopy['emptyValues'] {
  const key = requiredPathText(root, ...path) as keyof PvpRankingCommonCopy['emptyValues'];

  if (!(key in common.emptyValues)) {
    throw new Error(`pvpRankingCopy.${path.join('.')} must reference common.emptyValues.`);
  }

  return key;
}

function requiredLocale(value: Json | undefined, field: string): PvpRankingCopy['locale'] {
  const locale = requiredText(value, field);

  if (locale !== 'pl' && locale !== 'en') {
    throw new Error(`${field} must be pl or en.`);
  }

  return locale;
}

function requiredFallbackLocale(value: Json | undefined, field: string): 'en' {
  const locale = requiredText(value, field);

  if (locale !== 'en') {
    throw new Error(`${field} must be en.`);
  }

  return locale;
}
