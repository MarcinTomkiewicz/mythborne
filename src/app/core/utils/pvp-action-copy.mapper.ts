import {
  PvpActionCommonLabelsCopy,
  PvpActionCopy,
  PvpActionDisabledReasonTooltipsCopy,
} from '../domain/pvp/pvp-action-copy.model';
import { Json } from '../types/database.types';
import {
  JsonRecord,
  read,
  requiredRecord,
  requiredText,
} from './json-read';

const COPY_CONTRACT_KEY = 'pvp_action_copy';
const COPY_CONTRACT_VERSION = 'pvp_action_copy_v1';

export function mapPvpActionCopy(value: Json): PvpActionCopy {
  const root = requiredRecord(value, 'get_pvp_action_copy');
  const contractKey = requiredText(read(root, 'contractKey'), 'pvpActionCopy.contractKey');
  const contractVersion = requiredText(read(root, 'contractVersion'), 'pvpActionCopy.contractVersion');

  if (contractKey !== COPY_CONTRACT_KEY) {
    throw new Error(`pvpActionCopy.contractKey must be ${COPY_CONTRACT_KEY}.`);
  }

  if (contractVersion !== COPY_CONTRACT_VERSION) {
    throw new Error(`pvpActionCopy.contractVersion must be ${COPY_CONTRACT_VERSION}.`);
  }

  const common = requiredRecord(read(root, 'common'), 'pvpActionCopy.common');
  const activeAction = requiredRecord(read(root, 'activeAction'), 'pvpActionCopy.activeAction');
  const combatHandoff = requiredRecord(read(root, 'combatHandoff'), 'pvpActionCopy.combatHandoff');
  const eligibility = requiredRecord(read(root, 'eligibility'), 'pvpActionCopy.eligibility');

  return {
    contractKey,
    contractVersion,
    requestedLocale: requiredText(read(root, 'requestedLocale'), 'pvpActionCopy.requestedLocale'),
    locale: requiredLocale(read(root, 'locale'), 'pvpActionCopy.locale'),
    fallbackLocale: requiredFallbackLocale(read(root, 'fallbackLocale'), 'pvpActionCopy.fallbackLocale'),
    common: mapCommonCopy(common),
    activeAction: {
      panel: {
        defaultTitle: requiredPathText(activeAction, 'activeAction', 'panel', 'defaultTitle'),
        attackTitle: requiredPathText(activeAction, 'activeAction', 'panel', 'attackTitle'),
        spyTitle: requiredPathText(activeAction, 'activeAction', 'panel', 'spyTitle'),
        returnTitle: requiredPathText(activeAction, 'activeAction', 'panel', 'returnTitle'),
        attackAriaLabel: requiredPathText(activeAction, 'activeAction', 'panel', 'attackAriaLabel'),
        spyAriaLabel: requiredPathText(activeAction, 'activeAction', 'panel', 'spyAriaLabel'),
        returnAriaLabel: requiredPathText(activeAction, 'activeAction', 'panel', 'returnAriaLabel'),
      },
      time: {
        remainingTimeLabel: requiredPathText(activeAction, 'activeAction', 'time', 'remainingTimeLabel'),
        attackTravelLabel: requiredPathText(activeAction, 'activeAction', 'time', 'attackTravelLabel'),
        spyTravelLabel: requiredPathText(activeAction, 'activeAction', 'time', 'spyTravelLabel'),
        returnTravelLabel: requiredPathText(activeAction, 'activeAction', 'time', 'returnTravelLabel'),
        decisionWindowLabel: requiredPathText(activeAction, 'activeAction', 'time', 'decisionWindowLabel'),
      },
      phaseText: {
        attackTravel: requiredPathText(activeAction, 'activeAction', 'phaseText', 'attackTravel'),
        spyTravel: requiredPathText(activeAction, 'activeAction', 'phaseText', 'spyTravel'),
        attackManualWindow: requiredPathText(activeAction, 'activeAction', 'phaseText', 'attackManualWindow'),
        attackReturn: requiredPathText(activeAction, 'activeAction', 'phaseText', 'attackReturn'),
        attackResolved: requiredPathText(activeAction, 'activeAction', 'phaseText', 'attackResolved'),
        spyResolved: requiredPathText(activeAction, 'activeAction', 'phaseText', 'spyResolved'),
      },
      loading: {
        refreshSpyState: requiredPathText(activeAction, 'activeAction', 'loading', 'refreshSpyState'),
        refreshAttackState: requiredPathText(activeAction, 'activeAction', 'loading', 'refreshAttackState'),
        refreshDecisionState: requiredPathText(activeAction, 'activeAction', 'loading', 'refreshDecisionState'),
        refreshReturnState: requiredPathText(activeAction, 'activeAction', 'loading', 'refreshReturnState'),
        refreshUnknownState: requiredPathText(activeAction, 'activeAction', 'loading', 'refreshUnknownState'),
      },
      readyStates: {
        decisionReady: requiredPathText(activeAction, 'activeAction', 'readyStates', 'decisionReady'),
        targetReached: requiredPathText(activeAction, 'activeAction', 'readyStates', 'targetReached'),
        heroReturned: requiredPathText(activeAction, 'activeAction', 'readyStates', 'heroReturned'),
        reportReady: requiredPathText(activeAction, 'activeAction', 'readyStates', 'reportReady'),
      },
    },
    combatHandoff: {
      header: {
        eyebrowCommonKey: requiredCommonKey(
          combatHandoff,
          'common.labels.combat',
          'combatHandoff',
          'header',
          'eyebrowCommonKey',
        ),
        titleCommonKey: requiredCommonKey(
          combatHandoff,
          'common.labels.heroCombat',
          'combatHandoff',
          'header',
          'titleCommonKey',
        ),
        description: requiredPathText(combatHandoff, 'combatHandoff', 'header', 'description'),
      },
      decisionWindow: {
        eyebrow: requiredPathText(combatHandoff, 'combatHandoff', 'decisionWindow', 'eyebrow'),
        title: requiredPathText(combatHandoff, 'combatHandoff', 'decisionWindow', 'title'),
        description: requiredPathText(combatHandoff, 'combatHandoff', 'decisionWindow', 'description'),
        decisionWindowLabelCommonKey: requiredCommonKey(
          combatHandoff,
          'common.labels.decisionTime',
          'combatHandoff',
          'decisionWindow',
          'decisionWindowLabelCommonKey',
        ),
        manualActionCommonKey: requiredCommonKey(
          combatHandoff,
          'common.actionLabels.resolveManual',
          'combatHandoff',
          'decisionWindow',
          'manualActionCommonKey',
        ),
        autoActionCommonKey: requiredCommonKey(
          combatHandoff,
          'common.actionLabels.resolveAuto',
          'combatHandoff',
          'decisionWindow',
          'autoActionCommonKey',
        ),
        waitingForDecision: requiredPathText(
          combatHandoff,
          'combatHandoff',
          'decisionWindow',
          'waitingForDecision',
        ),
      },
      emptyCombatLog: {
        titleCommonKey: requiredCommonKey(
          combatHandoff,
          'common.labels.combatLog',
          'combatHandoff',
          'emptyCombatLog',
          'titleCommonKey',
        ),
        text: requiredPathText(combatHandoff, 'combatHandoff', 'emptyCombatLog', 'text'),
      },
    },
    eligibility: {
      statusLabels: {
        available: requiredPathText(eligibility, 'eligibility', 'statusLabels', 'available'),
        unavailable: requiredPathText(eligibility, 'eligibility', 'statusLabels', 'unavailable'),
        actionUnavailable: requiredPathText(eligibility, 'eligibility', 'statusLabels', 'actionUnavailable'),
      },
      disabledReasonTooltips: mapDisabledReasonTooltips(
        requiredRecord(read(eligibility, 'disabledReasonTooltips'), 'pvpActionCopy.eligibility.disabledReasonTooltips'),
      ),
    },
  };
}

function mapCommonCopy(root: JsonRecord): PvpActionCopy['common'] {
  const labels = requiredRecord(read(root, 'labels'), 'pvpActionCopy.common.labels');
  const richText = requiredRecord(read(root, 'richText'), 'pvpActionCopy.common.richText');
  const gloryLabel = requiredRecord(read(richText, 'gloryLabel'), 'pvpActionCopy.common.richText.gloryLabel');
  const emptyValues = requiredRecord(read(root, 'emptyValues'), 'pvpActionCopy.common.emptyValues');
  const actionLabels = requiredRecord(read(root, 'actionLabels'), 'pvpActionCopy.common.actionLabels');
  const actionTooltips = requiredRecord(read(root, 'actionTooltips'), 'pvpActionCopy.common.actionTooltips');

  return {
    labels: mapCommonLabels(labels),
    richText: {
      gloryLabel: {
        text: requiredText(read(gloryLabel, 'text'), 'pvpActionCopy.common.richText.gloryLabel.text'),
        tone: requiredRichTextTone(
          read(gloryLabel, 'tone'),
          'pvpActionCopy.common.richText.gloryLabel.tone',
        ),
      },
    },
    emptyValues: {
      noData: requiredText(read(emptyValues, 'noData'), 'pvpActionCopy.common.emptyValues.noData'),
      noTarget: requiredText(read(emptyValues, 'noTarget'), 'pvpActionCopy.common.emptyValues.noTarget'),
      noGuild: requiredText(read(emptyValues, 'noGuild'), 'pvpActionCopy.common.emptyValues.noGuild'),
      noAttackProtection: requiredText(
        read(emptyValues, 'noAttackProtection'),
        'pvpActionCopy.common.emptyValues.noAttackProtection',
      ),
      noValue: requiredText(read(emptyValues, 'noValue'), 'pvpActionCopy.common.emptyValues.noValue'),
    },
    actionLabels: {
      refresh: requiredText(read(actionLabels, 'refresh'), 'pvpActionCopy.common.actionLabels.refresh'),
      openReport: requiredText(read(actionLabels, 'openReport'), 'pvpActionCopy.common.actionLabels.openReport'),
      resolveManual: requiredText(read(actionLabels, 'resolveManual'), 'pvpActionCopy.common.actionLabels.resolveManual'),
      resolveAuto: requiredText(read(actionLabels, 'resolveAuto'), 'pvpActionCopy.common.actionLabels.resolveAuto'),
      enterCombat: requiredText(read(actionLabels, 'enterCombat'), 'pvpActionCopy.common.actionLabels.enterCombat'),
      backToVicinity: requiredText(read(actionLabels, 'backToVicinity'), 'pvpActionCopy.common.actionLabels.backToVicinity'),
      attack: requiredText(read(actionLabels, 'attack'), 'pvpActionCopy.common.actionLabels.attack'),
      spy: requiredText(read(actionLabels, 'spy'), 'pvpActionCopy.common.actionLabels.spy'),
      siege: requiredText(read(actionLabels, 'siege'), 'pvpActionCopy.common.actionLabels.siege'),
    },
    actionTooltips: {
      attack: requiredText(read(actionTooltips, 'attack'), 'pvpActionCopy.common.actionTooltips.attack'),
      spy: requiredText(read(actionTooltips, 'spy'), 'pvpActionCopy.common.actionTooltips.spy'),
      siegeUnavailable: requiredText(
        read(actionTooltips, 'siegeUnavailable'),
        'pvpActionCopy.common.actionTooltips.siegeUnavailable',
      ),
      resolveManual: requiredText(
        read(actionTooltips, 'resolveManual'),
        'pvpActionCopy.common.actionTooltips.resolveManual',
      ),
      resolveAuto: requiredText(read(actionTooltips, 'resolveAuto'), 'pvpActionCopy.common.actionTooltips.resolveAuto'),
      openReport: requiredText(read(actionTooltips, 'openReport'), 'pvpActionCopy.common.actionTooltips.openReport'),
      refresh: requiredText(read(actionTooltips, 'refresh'), 'pvpActionCopy.common.actionTooltips.refresh'),
    },
  };
}

function mapCommonLabels(root: JsonRecord): PvpActionCommonLabelsCopy {
  return {
    combat: commonLabel(root, 'combat'),
    heroCombat: commonLabel(root, 'heroCombat'),
    attack: commonLabel(root, 'attack'),
    attackAction: commonLabel(root, 'attackAction'),
    spyAction: commonLabel(root, 'spyAction'),
    spyProgress: commonLabel(root, 'spyProgress'),
    scouting: commonLabel(root, 'scouting'),
    siege: commonLabel(root, 'siege'),
    report: commonLabel(root, 'report'),
    combatReport: commonLabel(root, 'combatReport'),
    spyReport: commonLabel(root, 'spyReport'),
    target: commonLabel(root, 'target'),
    action: commonLabel(root, 'action'),
    state: commonLabel(root, 'state'),
    address: commonLabel(root, 'address'),
    targetAddress: commonLabel(root, 'targetAddress'),
    yourAddress: commonLabel(root, 'yourAddress'),
    protection: commonLabel(root, 'protection'),
    actions: commonLabel(root, 'actions'),
    guild: commonLabel(root, 'guild'),
    level: commonLabel(root, 'level'),
    rankPosition: commonLabel(root, 'rankPosition'),
    remainingTime: commonLabel(root, 'remainingTime'),
    arrivalTime: commonLabel(root, 'arrivalTime'),
    availableFrom: commonLabel(root, 'availableFrom'),
    decisionTime: commonLabel(root, 'decisionTime'),
    combatLog: commonLabel(root, 'combatLog'),
    result: commonLabel(root, 'result'),
    battleLoot: commonLabel(root, 'battleLoot'),
    resources: commonLabel(root, 'resources'),
    experience: commonLabel(root, 'experience'),
    glory: commonLabel(root, 'glory'),
    rank: commonLabel(root, 'rank'),
    buildings: commonLabel(root, 'buildings'),
    equipment: commonLabel(root, 'equipment'),
    stats: commonLabel(root, 'stats'),
    detection: commonLabel(root, 'detection'),
  };
}

function mapDisabledReasonTooltips(root: JsonRecord): PvpActionDisabledReasonTooltipsCopy {
  return {
    targetProtected: requiredText(read(root, 'targetProtected'), 'pvpActionCopy.eligibility.disabledReasonTooltips.targetProtected'),
    attackerBusy: requiredText(read(root, 'attackerBusy'), 'pvpActionCopy.eligibility.disabledReasonTooltips.attackerBusy'),
    targetLevelTooHigh: requiredText(read(root, 'targetLevelTooHigh'), 'pvpActionCopy.eligibility.disabledReasonTooltips.targetLevelTooHigh'),
    targetLevelTooLow: requiredText(read(root, 'targetLevelTooLow'), 'pvpActionCopy.eligibility.disabledReasonTooltips.targetLevelTooLow'),
    sameGuild: requiredText(read(root, 'sameGuild'), 'pvpActionCopy.eligibility.disabledReasonTooltips.sameGuild'),
    actionUnavailable: requiredText(read(root, 'actionUnavailable'), 'pvpActionCopy.eligibility.disabledReasonTooltips.actionUnavailable'),
    dailyAttackLimitReached: requiredText(read(root, 'dailyAttackLimitReached'), 'pvpActionCopy.eligibility.disabledReasonTooltips.dailyAttackLimitReached'),
    cooldownActive: requiredText(read(root, 'cooldownActive'), 'pvpActionCopy.eligibility.disabledReasonTooltips.cooldownActive'),
    siegeNotAvailable: requiredText(read(root, 'siegeNotAvailable'), 'pvpActionCopy.eligibility.disabledReasonTooltips.siegeNotAvailable'),
  };
}

function commonLabel(root: JsonRecord, key: keyof PvpActionCommonLabelsCopy): string {
  return requiredText(read(root, key), `pvpActionCopy.common.labels.${key}`);
}

function requiredPathText(root: JsonRecord, rootName: string, ...path: string[]): string {
  const fieldPath = `pvpActionCopy.${path.join('.')}`;
  const value = path.reduce<Json | undefined>((current, key) =>
    read(requiredRecord(current, fieldPath), key), root);

  return requiredText(value, `${rootName}.${path.join('.')}`);
}

function requiredCommonKey<Expected extends string>(
  root: JsonRecord,
  expected: Expected,
  rootName: string,
  ...path: string[]
): Expected {
  const value = requiredPathText(root, rootName, ...path);

  if (value !== expected) {
    throw new Error(`pvpActionCopy.${path.join('.')} must be ${expected}.`);
  }

  return value as Expected;
}

function requiredLocale(value: Json | undefined, field: string): PvpActionCopy['locale'] {
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

function requiredRichTextTone(value: Json | undefined, field: string): PvpActionCopy['common']['richText']['gloryLabel']['tone'] {
  const tone = requiredText(value, field);

  if (
    tone !== 'heading' &&
    tone !== 'info' &&
    tone !== 'warn' &&
    tone !== 'success' &&
    tone !== 'danger'
  ) {
    throw new Error(`${field} has unsupported tone.`);
  }

  return tone;
}
