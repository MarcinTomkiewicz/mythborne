import {
  EXPLORATION_DIFFICULTY_COPY_ARTICLE_KEY,
  EXPLORATION_DIFFICULTY_COPY_CONTRACT_VERSION,
  EXPLORATION_DIFFICULTY_COPY_KEYS,
  EXPLORATION_DIFFICULTY_TRIAL_KEYS,
  ExplorationDifficultyActionCopy,
  ExplorationDifficultyCardCopy,
  ExplorationDifficultyCopy,
  ExplorationDifficultyCopyKey,
  ExplorationDifficultyHeaderCopy,
  ExplorationDifficultyMetricLabelsCopy,
  ExplorationDifficultyRichTextFragment,
  ExplorationDifficultySectionCopy,
  ExplorationDifficultySectionIntroCopy,
  ExplorationDifficultyStatusEmptyValuesCopy,
  ExplorationDifficultyStatusLabelsCopy,
  ExplorationDifficultyStatusPanelCopy,
  ExplorationDifficultyTrialDetailsCopy,
  ExplorationDifficultyTrialDetailsLabelsCopy,
  ExplorationDifficultyTrialDetailsSectionCopy,
  ExplorationDifficultyTrialKey,
} from '../domain/game-copy/exploration-difficulty-copy.model';
import { Json } from '../types/database.types';
import {
  JsonRecord,
  read,
  requiredRecord,
  requiredText,
  requireLiteral,
} from './json-read';
import { mapRichTextFragments } from './rich-text.mapper';

export function mapExplorationDifficultyCopy(value: Json): ExplorationDifficultyCopy {
  const root = requiredRecord(value, 'get_player_exploration_difficulty_copy');
  const contractVersion = requiredText(
    read(root, 'contractVersion'),
    'exploration difficulty contractVersion',
  );
  const locale = requiredText(read(root, 'locale'), 'exploration difficulty locale');
  const articleKey = requiredText(
    read(root, 'articleKey'),
    'exploration difficulty articleKey',
  );

  return {
    contractVersion: requireLiteral(
      contractVersion,
      EXPLORATION_DIFFICULTY_COPY_CONTRACT_VERSION,
      'exploration difficulty contractVersion',
    ),
    locale: requireLiteral(locale, 'pl', 'exploration difficulty locale'),
    articleKey: requireLiteral(
      articleKey,
      EXPLORATION_DIFFICULTY_COPY_ARTICLE_KEY,
      'exploration difficulty articleKey',
    ),
    header: mapHeader(
      requiredRecord(read(root, 'header'), 'exploration difficulty header'),
    ),
    statusPanel: mapStatusPanel(
      requiredRecord(
        read(root, 'statusPanel'),
        'exploration difficulty statusPanel',
      ),
    ),
    difficulty: mapDifficulty(
      requiredRecord(read(root, 'difficulty'), 'exploration difficulty'),
    ),
    trialDetails: mapTrialDetails(
      requiredRecord(read(root, 'trialDetails'), 'exploration difficulty trialDetails'),
    ),
  };
}

function mapHeader(record: JsonRecord): ExplorationDifficultyHeaderCopy {
  return {
    eyebrow: requiredText(read(record, 'eyebrow'), 'exploration difficulty header.eyebrow'),
    title: requiredText(read(record, 'title'), 'exploration difficulty header.title'),
    intro: requiredText(read(record, 'intro'), 'exploration difficulty header.intro'),
  };
}

function mapStatusPanel(
  record: JsonRecord,
): ExplorationDifficultyStatusPanelCopy {
  return {
    labels: mapStatusLabels(
      requiredRecord(
        read(record, 'labels'),
        'exploration difficulty statusPanel.labels',
      ),
    ),
    emptyValues: mapStatusEmptyValues(
      requiredRecord(
        read(record, 'emptyValues'),
        'exploration difficulty statusPanel.emptyValues',
      ),
    ),
  };
}

function mapStatusLabels(
  record: JsonRecord,
): ExplorationDifficultyStatusLabelsCopy {
  return {
    difficulty: requiredText(
      read(record, 'difficulty'),
      'exploration difficulty statusPanel.labels.difficulty',
    ),
    estimatedAutoResult: requiredText(
      read(record, 'estimatedAutoResult'),
      'exploration difficulty statusPanel.labels.estimatedAutoResult',
    ),
    trialsToday: requiredText(
      read(record, 'trialsToday'),
      'exploration difficulty statusPanel.labels.trialsToday',
    ),
    activeEffect: requiredText(
      read(record, 'activeEffect'),
      'exploration difficulty statusPanel.labels.activeEffect',
    ),
  };
}

function mapStatusEmptyValues(
  record: JsonRecord,
): ExplorationDifficultyStatusEmptyValuesCopy {
  return {
    noDifficulty: requiredText(
      read(record, 'noDifficulty'),
      'exploration difficulty statusPanel.emptyValues.noDifficulty',
    ),
    noAutoResult: requiredText(
      read(record, 'noAutoResult'),
      'exploration difficulty statusPanel.emptyValues.noAutoResult',
    ),
    noTrials: requiredText(
      read(record, 'noTrials'),
      'exploration difficulty statusPanel.emptyValues.noTrials',
    ),
    noEffect: requiredText(
      read(record, 'noEffect'),
      'exploration difficulty statusPanel.emptyValues.noEffect',
    ),
  };
}

function mapDifficulty(record: JsonRecord): ExplorationDifficultySectionCopy {
  return {
    section: mapDifficultySection(
      requiredRecord(
        read(record, 'section'),
        'exploration difficulty difficulty.section',
      ),
    ),
    cards: mapDifficultyCards(
      requiredRecord(read(record, 'cards'), 'exploration difficulty difficulty.cards'),
    ),
    metrics: mapMetrics(
      requiredRecord(
        read(record, 'metrics'),
        'exploration difficulty difficulty.metrics',
      ),
    ),
    actions: mapActions(
      requiredRecord(
        read(record, 'actions'),
        'exploration difficulty difficulty.actions',
      ),
    ),
  };
}

function mapDifficultySection(
  record: JsonRecord,
): ExplorationDifficultySectionIntroCopy {
  return {
    title: requiredText(
      read(record, 'title'),
      'exploration difficulty difficulty.section.title',
    ),
    description: requiredText(
      read(record, 'description'),
      'exploration difficulty difficulty.section.description',
    ),
  };
}

function mapDifficultyCards(
  record: JsonRecord,
): Record<ExplorationDifficultyCopyKey, ExplorationDifficultyCardCopy> {
  return EXPLORATION_DIFFICULTY_COPY_KEYS.reduce(
    (result, difficultyKey) => ({
      ...result,
      [difficultyKey]: mapDifficultyCard(
        requiredRecord(
          read(record, difficultyKey),
          `exploration difficulty difficulty.cards.${difficultyKey}`,
        ),
        difficultyKey,
      ),
    }),
    {} as Record<ExplorationDifficultyCopyKey, ExplorationDifficultyCardCopy>,
  );
}

function mapDifficultyCard(
  record: JsonRecord,
  difficultyKey: ExplorationDifficultyCopyKey,
): ExplorationDifficultyCardCopy {
  const field = `exploration difficulty difficulty.cards.${difficultyKey}`;

  return {
    title: requiredText(read(record, 'title'), `${field}.title`),
    subtitle: requiredText(read(record, 'subtitle'), `${field}.subtitle`),
    description: requiredText(read(record, 'description'), `${field}.description`),
  };
}

function mapMetrics(
  record: JsonRecord,
): ExplorationDifficultyMetricLabelsCopy {
  return {
    duration: requiredText(
      read(record, 'duration'),
      'exploration difficulty difficulty.metrics.duration',
    ),
    trialChance: requiredText(
      read(record, 'trialChance'),
      'exploration difficulty difficulty.metrics.trialChance',
    ),
    manifestationChance: requiredText(
      read(record, 'manifestationChance'),
      'exploration difficulty difficulty.metrics.manifestationChance',
    ),
    autoResolveChance: requiredText(
      read(record, 'autoResolveChance'),
      'exploration difficulty difficulty.metrics.autoResolveChance',
    ),
    rewardItems: requiredText(
      read(record, 'rewardItems'),
      'exploration difficulty difficulty.metrics.rewardItems',
    ),
  };
}

function mapActions(record: JsonRecord): ExplorationDifficultyActionCopy {
  return {
    startExploration: requiredText(
      read(record, 'startExploration'),
      'exploration difficulty difficulty.actions.startExploration',
    ),
    continueExploration: requiredText(
      read(record, 'continueExploration'),
      'exploration difficulty difficulty.actions.continueExploration',
    ),
    changeDifficulty: requiredText(
      read(record, 'changeDifficulty'),
      'exploration difficulty difficulty.actions.changeDifficulty',
    ),
  };
}

function mapTrialDetails(
  record: JsonRecord,
): ExplorationDifficultyTrialDetailsCopy {
  return {
    section: mapTrialDetailsSection(
      requiredRecord(
        read(record, 'section'),
        'exploration difficulty trialDetails.section',
      ),
    ),
    labels: mapTrialDetailsLabels(
      requiredRecord(
        read(record, 'labels'),
        'exploration difficulty trialDetails.labels',
      ),
    ),
    trials: mapTrialLabels(
      requiredRecord(
        read(record, 'trials'),
        'exploration difficulty trialDetails.trials',
      ),
    ),
  };
}

function mapTrialDetailsSection(
  record: JsonRecord,
): ExplorationDifficultyTrialDetailsSectionCopy {
  return {
    title: requiredText(
      read(record, 'title'),
      'exploration difficulty trialDetails.section.title',
    ),
    descriptionPlainText: requiredText(
      read(record, 'descriptionPlainText'),
      'exploration difficulty trialDetails.section.descriptionPlainText',
    ),
    descriptionRichText: mapRichTextFragments(
      read(record, 'descriptionRichText'),
      'exploration difficulty trialDetails.section.descriptionRichText',
      requireTextFragmentKind,
    ) as ExplorationDifficultyRichTextFragment[],
  };
}

function mapTrialDetailsLabels(
  record: JsonRecord,
): ExplorationDifficultyTrialDetailsLabelsCopy {
  return {
    selectedDifficulty: requiredText(
      read(record, 'selectedDifficulty'),
      'exploration difficulty trialDetails.labels.selectedDifficulty',
    ),
    manifestation: requiredText(
      read(record, 'manifestation'),
      'exploration difficulty trialDetails.labels.manifestation',
    ),
    autoResult: requiredText(
      read(record, 'autoResult'),
      'exploration difficulty trialDetails.labels.autoResult',
    ),
  };
}

function mapTrialLabels(
  record: JsonRecord,
): Record<ExplorationDifficultyTrialKey, string> {
  return EXPLORATION_DIFFICULTY_TRIAL_KEYS.reduce(
    (result, trialKey) => ({
      ...result,
      [trialKey]: requiredText(
        read(record, trialKey),
        `exploration difficulty trialDetails.trials.${trialKey}`,
      ),
    }),
    {} as Record<ExplorationDifficultyTrialKey, string>,
  );
}

function requireTextFragmentKind(value: string, field: string): 'text' {
  return requireLiteral(value, 'text', field);
}
