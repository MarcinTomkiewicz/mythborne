import {
  PvpActionCommonLabelsCopy,
  PvpActionCopy,
  PvpActionDisabledReasonTooltipsCopy,
} from '../domain/pvp/pvp-action-copy.model';
import { Json } from '../types/database.types';
import {
  JsonRecord,
  jsonRecord,
  read,
  requiredRecord,
  requiredText,
} from './json-read';
import { copyTextOrKey } from './game-copy-key-fallback';

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

  const common = jsonRecord(read(root, 'common')) ?? {};
  const activeAction = jsonRecord(read(root, 'activeAction')) ?? {};
  const combatHandoff = jsonRecord(read(root, 'combatHandoff')) ?? {};
  const eligibility = jsonRecord(read(root, 'eligibility')) ?? {};

  return {
    contractKey,
    contractVersion,
    requestedLocale: requiredText(read(root, 'requestedLocale'), 'pvpActionCopy.requestedLocale'),
    locale: requiredLocale(read(root, 'locale'), 'pvpActionCopy.locale'),
    fallbackLocale: requiredFallbackLocale(read(root, 'fallbackLocale'), 'pvpActionCopy.fallbackLocale'),
    common: mapCommonCopy(common),
    activeAction: {
      panel: {
        defaultTitle: copyPathText(activeAction, 'activeAction', 'panel', 'defaultTitle'),
        attackTitle: copyPathText(activeAction, 'activeAction', 'panel', 'attackTitle'),
        spyTitle: copyPathText(activeAction, 'activeAction', 'panel', 'spyTitle'),
        returnTitle: copyPathText(activeAction, 'activeAction', 'panel', 'returnTitle'),
        attackAriaLabel: copyPathText(activeAction, 'activeAction', 'panel', 'attackAriaLabel'),
        spyAriaLabel: copyPathText(activeAction, 'activeAction', 'panel', 'spyAriaLabel'),
        returnAriaLabel: copyPathText(activeAction, 'activeAction', 'panel', 'returnAriaLabel'),
      },
      time: {
        remainingTimeLabel: copyPathText(activeAction, 'activeAction', 'time', 'remainingTimeLabel'),
        attackTravelLabel: copyPathText(activeAction, 'activeAction', 'time', 'attackTravelLabel'),
        spyTravelLabel: copyPathText(activeAction, 'activeAction', 'time', 'spyTravelLabel'),
        returnTravelLabel: copyPathText(activeAction, 'activeAction', 'time', 'returnTravelLabel'),
        decisionWindowLabel: copyPathText(activeAction, 'activeAction', 'time', 'decisionWindowLabel'),
      },
      phaseText: {
        attackTravel: copyPathText(activeAction, 'activeAction', 'phaseText', 'attackTravel'),
        spyTravel: copyPathText(activeAction, 'activeAction', 'phaseText', 'spyTravel'),
        attackManualWindow: copyPathText(activeAction, 'activeAction', 'phaseText', 'attackManualWindow'),
        attackReturn: copyPathText(activeAction, 'activeAction', 'phaseText', 'attackReturn'),
        attackResolved: copyPathText(activeAction, 'activeAction', 'phaseText', 'attackResolved'),
        spyResolved: copyPathText(activeAction, 'activeAction', 'phaseText', 'spyResolved'),
      },
      loading: {
        refreshSpyState: copyPathText(activeAction, 'activeAction', 'loading', 'refreshSpyState'),
        refreshAttackState: copyPathText(activeAction, 'activeAction', 'loading', 'refreshAttackState'),
        refreshDecisionState: copyPathText(activeAction, 'activeAction', 'loading', 'refreshDecisionState'),
        refreshReturnState: copyPathText(activeAction, 'activeAction', 'loading', 'refreshReturnState'),
        refreshUnknownState: copyPathText(activeAction, 'activeAction', 'loading', 'refreshUnknownState'),
      },
      readyStates: {
        decisionReady: copyPathText(activeAction, 'activeAction', 'readyStates', 'decisionReady'),
        targetReached: copyPathText(activeAction, 'activeAction', 'readyStates', 'targetReached'),
        heroReturned: copyPathText(activeAction, 'activeAction', 'readyStates', 'heroReturned'),
        reportReady: copyPathText(activeAction, 'activeAction', 'readyStates', 'reportReady'),
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
        description: copyPathText(combatHandoff, 'combatHandoff', 'header', 'description'),
      },
      decisionWindow: {
        eyebrow: copyPathText(combatHandoff, 'combatHandoff', 'decisionWindow', 'eyebrow'),
        title: copyPathText(combatHandoff, 'combatHandoff', 'decisionWindow', 'title'),
        description: copyPathText(combatHandoff, 'combatHandoff', 'decisionWindow', 'description'),
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
        waitingForDecision: copyPathText(
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
        text: copyPathText(combatHandoff, 'combatHandoff', 'emptyCombatLog', 'text'),
      },
    },
    eligibility: {
      statusLabels: {
        available: copyPathText(eligibility, 'eligibility', 'statusLabels', 'available'),
        unavailable: copyPathText(eligibility, 'eligibility', 'statusLabels', 'unavailable'),
        actionUnavailable: copyPathText(eligibility, 'eligibility', 'statusLabels', 'actionUnavailable'),
      },
      disabledReasonTooltips: mapDisabledReasonTooltips(
        jsonRecord(read(eligibility, 'disabledReasonTooltips')) ?? {},
      ),
    },
  };
}

function mapCommonCopy(root: JsonRecord): PvpActionCopy['common'] {
  const labels = jsonRecord(read(root, 'labels')) ?? {};
  const richText = jsonRecord(read(root, 'richText')) ?? {};
  const gloryLabel = jsonRecord(read(richText, 'gloryLabel')) ?? {};
  const emptyValues = jsonRecord(read(root, 'emptyValues')) ?? {};
  const actionLabels = jsonRecord(read(root, 'actionLabels')) ?? {};
  const actionTooltips = jsonRecord(read(root, 'actionTooltips')) ?? {};

  return {
    labels: mapCommonLabels(labels),
    richText: {
      gloryLabel: {
        text: copyTextOrKey(
          read(gloryLabel, 'text'),
          'pvpActionCopy.common.richText.gloryLabel.text',
        ),
        tone: richTextToneOrDefault(
          read(gloryLabel, 'tone'),
          'pvpActionCopy.common.richText.gloryLabel.tone',
        ),
      },
    },
    emptyValues: {
      noData: copyTextOrKey(read(emptyValues, 'noData'), 'pvpActionCopy.common.emptyValues.noData'),
      noTarget: copyTextOrKey(read(emptyValues, 'noTarget'), 'pvpActionCopy.common.emptyValues.noTarget'),
      noGuild: copyTextOrKey(read(emptyValues, 'noGuild'), 'pvpActionCopy.common.emptyValues.noGuild'),
      noAttackProtection: copyTextOrKey(
        read(emptyValues, 'noAttackProtection'),
        'pvpActionCopy.common.emptyValues.noAttackProtection',
      ),
      noValue: copyTextOrKey(read(emptyValues, 'noValue'), 'pvpActionCopy.common.emptyValues.noValue'),
    },
    actionLabels: {
      refresh: copyTextOrKey(read(actionLabels, 'refresh'), 'pvpActionCopy.common.actionLabels.refresh'),
      openReport: copyTextOrKey(read(actionLabels, 'openReport'), 'pvpActionCopy.common.actionLabels.openReport'),
      resolveManual: copyTextOrKey(
        read(actionLabels, 'resolveManual'),
        'pvpActionCopy.common.actionLabels.resolveManual',
      ),
      resolveAuto: copyTextOrKey(read(actionLabels, 'resolveAuto'), 'pvpActionCopy.common.actionLabels.resolveAuto'),
      enterCombat: copyTextOrKey(read(actionLabels, 'enterCombat'), 'pvpActionCopy.common.actionLabels.enterCombat'),
      backToVicinity: copyTextOrKey(
        read(actionLabels, 'backToVicinity'),
        'pvpActionCopy.common.actionLabels.backToVicinity',
      ),
      attack: copyTextOrKey(read(actionLabels, 'attack'), 'pvpActionCopy.common.actionLabels.attack'),
      spy: copyTextOrKey(read(actionLabels, 'spy'), 'pvpActionCopy.common.actionLabels.spy'),
      siege: copyTextOrKey(read(actionLabels, 'siege'), 'pvpActionCopy.common.actionLabels.siege'),
    },
    actionTooltips: {
      attack: copyTextOrKey(read(actionTooltips, 'attack'), 'pvpActionCopy.common.actionTooltips.attack'),
      spy: copyTextOrKey(read(actionTooltips, 'spy'), 'pvpActionCopy.common.actionTooltips.spy'),
      siegeUnavailable: copyTextOrKey(
        read(actionTooltips, 'siegeUnavailable'),
        'pvpActionCopy.common.actionTooltips.siegeUnavailable',
      ),
      resolveManual: copyTextOrKey(
        read(actionTooltips, 'resolveManual'),
        'pvpActionCopy.common.actionTooltips.resolveManual',
      ),
      resolveAuto: copyTextOrKey(
        read(actionTooltips, 'resolveAuto'),
        'pvpActionCopy.common.actionTooltips.resolveAuto',
      ),
      openReport: copyTextOrKey(read(actionTooltips, 'openReport'), 'pvpActionCopy.common.actionTooltips.openReport'),
      refresh: copyTextOrKey(read(actionTooltips, 'refresh'), 'pvpActionCopy.common.actionTooltips.refresh'),
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
    targetProtected: copyTextOrKey(
      read(root, 'targetProtected'),
      'pvpActionCopy.eligibility.disabledReasonTooltips.targetProtected',
    ),
    attackerBusy: copyTextOrKey(
      read(root, 'attackerBusy'),
      'pvpActionCopy.eligibility.disabledReasonTooltips.attackerBusy',
    ),
    targetLevelTooHigh: copyTextOrKey(
      read(root, 'targetLevelTooHigh'),
      'pvpActionCopy.eligibility.disabledReasonTooltips.targetLevelTooHigh',
    ),
    targetLevelTooLow: copyTextOrKey(
      read(root, 'targetLevelTooLow'),
      'pvpActionCopy.eligibility.disabledReasonTooltips.targetLevelTooLow',
    ),
    sameGuild: copyTextOrKey(
      read(root, 'sameGuild'),
      'pvpActionCopy.eligibility.disabledReasonTooltips.sameGuild',
    ),
    actionUnavailable: copyTextOrKey(
      read(root, 'actionUnavailable'),
      'pvpActionCopy.eligibility.disabledReasonTooltips.actionUnavailable',
    ),
    dailyAttackLimitReached: copyTextOrKey(
      read(root, 'dailyAttackLimitReached'),
      'pvpActionCopy.eligibility.disabledReasonTooltips.dailyAttackLimitReached',
    ),
    cooldownActive: copyTextOrKey(
      read(root, 'cooldownActive'),
      'pvpActionCopy.eligibility.disabledReasonTooltips.cooldownActive',
    ),
    siegeNotAvailable: copyTextOrKey(
      read(root, 'siegeNotAvailable'),
      'pvpActionCopy.eligibility.disabledReasonTooltips.siegeNotAvailable',
    ),
  };
}

function commonLabel(root: JsonRecord, key: keyof PvpActionCommonLabelsCopy): string {
  return copyTextOrKey(read(root, key), `pvpActionCopy.common.labels.${key}`);
}

function copyPathText(root: JsonRecord, rootName: string, ...path: string[]): string {
  const value = path.reduce<Json | undefined>((current, key) =>
    read(jsonRecord(current), key), root);

  return copyTextOrKey(value, `pvpActionCopy.${rootName}.${path.join('.')}`);
}

function requiredCommonKey<Expected extends string>(
  root: JsonRecord,
  expected: Expected,
  rootName: string,
  ...path: string[]
): Expected {
  const value = copyPathText(root, rootName, ...path);

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

function richTextToneOrDefault(
  value: Json | undefined,
  field: string,
): PvpActionCopy['common']['richText']['gloryLabel']['tone'] {
  return value === undefined || value === null
    ? 'heading'
    : requiredRichTextTone(value, field);
}
