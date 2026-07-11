import {
  EXPLORATION_DIFFICULTY_COPY_ARTICLE_KEY,
  EXPLORATION_DIFFICULTY_CONTRACT_VERSION,
  EXPLORATION_DIFFICULTY_COPY_KEYS,
  EXPLORATION_DIFFICULTY_TRIAL_KEYS,
  type ExplorationDifficultyCardCopy,
  type ExplorationDifficultyCopy,
  type ExplorationDifficultyCopyKey,
  type ExplorationDifficultyRichTextFragment,
  type ExplorationDifficultyTrialKey,
} from '../domain/game-copy/exploration-difficulty-copy.model';
import type { Json } from '../types/database.types';
import {
  read,
  requiredRecord,
  requiredRecordField,
  requiredText,
  requiredTextFields,
  requireLiteral,
} from './json-read';
import { mapRichTextFragments } from './rich-text.mapper';

export function mapExplorationDifficultyCopy(value: Json): ExplorationDifficultyCopy {
  const path = 'exploration difficulty';
  const root = requiredRecord(value, 'get_player_exploration_difficulty_copy');
  const header = requiredRecord(read(root, 'header'), `${path} header`);
  const statusPanel = requiredRecord(read(root, 'statusPanel'), `${path} statusPanel`);
  const statusLabels = requiredRecordField(statusPanel, 'labels', `${path} statusPanel`);
  const statusEmpty = requiredRecordField(statusPanel, 'emptyValues', `${path} statusPanel`);
  const difficulty = requiredRecord(read(root, 'difficulty'), `${path} difficulty`);
  const difficultySection = requiredRecordField(difficulty, 'section', `${path} difficulty`);
  const difficultyCards = requiredRecordField(difficulty, 'cards', `${path} difficulty`);
  const difficultyMetrics = requiredRecordField(difficulty, 'metrics', `${path} difficulty`);
  const difficultyActions = requiredRecordField(difficulty, 'actions', `${path} difficulty`);
  const trialDetails = requiredRecord(read(root, 'trialDetails'), `${path} trialDetails`);
  const trialSection = requiredRecordField(trialDetails, 'section', `${path} trialDetails`);
  const trialLabels = requiredRecordField(trialDetails, 'labels', `${path} trialDetails`);
  const trials = requiredRecordField(trialDetails, 'trials', `${path} trialDetails`);

  return {
    contractVersion: requireLiteral(requiredText(
      read(root, 'contractVersion'), `${path} contractVersion`,
    ), EXPLORATION_DIFFICULTY_CONTRACT_VERSION, `${path} contractVersion`),
    locale: requireLiteral(requiredText(
      read(root, 'locale'), `${path} locale`,
    ), 'pl', `${path} locale`),
    articleKey: requireLiteral(requiredText(
      read(root, 'articleKey'), `${path} articleKey`,
    ), EXPLORATION_DIFFICULTY_COPY_ARTICLE_KEY, `${path} articleKey`),
    header: requiredTextFields(header, `${path} header`, ['eyebrow', 'title', 'intro']),
    statusPanel: {
      labels: requiredTextFields(statusLabels, `${path} statusPanel.labels`, [
        'difficulty', 'estimatedAutoResult', 'trialsToday', 'activeEffect',
      ]),
      emptyValues: requiredTextFields(statusEmpty, `${path} statusPanel.emptyValues`, [
        'noDifficulty', 'noAutoResult', 'noTrials', 'noEffect',
      ]),
    },
    difficulty: {
      section: requiredTextFields(difficultySection, `${path} difficulty.section`, [
        'title', 'description',
      ]),
      cards: EXPLORATION_DIFFICULTY_COPY_KEYS.reduce((result, key) => {
        const field = `${path} difficulty.cards.${key}`;
        result[key] = requiredTextFields(
          requiredRecordField(difficultyCards, key, `${path} difficulty.cards`),
          field,
          ['title', 'subtitle', 'description'],
        );
        return result;
      }, {} as Record<ExplorationDifficultyCopyKey, ExplorationDifficultyCardCopy>),
      metrics: requiredTextFields(difficultyMetrics, `${path} difficulty.metrics`, [
        'duration', 'trialChance', 'manifestationChance', 'autoResolveChance', 'rewardItems',
      ]),
      actions: requiredTextFields(difficultyActions, `${path} difficulty.actions`, [
        'startExploration', 'continueExploration', 'changeDifficulty',
      ]),
    },
    trialDetails: {
      section: {
        ...requiredTextFields(trialSection, `${path} trialDetails.section`, [
          'title', 'descriptionPlainText',
        ]),
        descriptionRichText: mapRichTextFragments(
          read(trialSection, 'descriptionRichText'),
          `${path} trialDetails.section.descriptionRichText`,
          (kind, field) => requireLiteral(kind, 'text', field),
        ) as ExplorationDifficultyRichTextFragment[],
      },
      labels: requiredTextFields(trialLabels, `${path} trialDetails.labels`, [
        'selectedDifficulty', 'manifestation', 'autoResult',
      ]),
      trials: EXPLORATION_DIFFICULTY_TRIAL_KEYS.reduce((result, key) => {
        result[key] = requiredText(
          read(trials, key),
          `${path} trialDetails.trials.${key}`,
        );
        return result;
      }, {} as Record<ExplorationDifficultyTrialKey, string>),
    },
  };
}
