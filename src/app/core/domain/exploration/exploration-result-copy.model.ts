import {
  RichTextFragment,
  RichTextTone,
} from '../rich-text/rich-text.model';

export type ExplorationRichTextTone = RichTextTone;

export type ExplorationRichTextFragmentKind =
  | 'text'
  | 'patronRef'
  | 'trialTitleRef'
  | 'experience'
  | 'resource'
  | 'itemRef'
  | 'effect'
  | 'stat'
  | 'value';

export interface ExplorationRichTextFragment extends RichTextFragment {
  kind: ExplorationRichTextFragmentKind;
  tone?: ExplorationRichTextTone;
}

export interface ExplorationResultNarrativeMetadata {
  trialKey?: string | null;
  patronKey?: string | null;
  encounterKey?: string | null;
  encounterKind?: string | null;
  rewardEligibility?: string | null;
  completionMode?: string | null;
  success?: boolean | null;
  sourceId?: string | null;
}

export interface ExplorationResultNarrativeSnapshot {
  contractVersion: 'exploration_result_narrative_snapshot_v1';
  locale: 'pl' | string;
  selectedCopyKey: string;
  sourceKind: 'step' | 'trial' | 'encounter' | string;
  resultKind: string;
  eyebrow: string;
  title: string;
  titleTone: ExplorationRichTextTone;
  narrativePlainText: string;
  narrativeRichText: ExplorationRichTextFragment[];
  rewardPlainText?: string | null;
  rewardRichText?: ExplorationRichTextFragment[] | null;
  effectPlainText?: string | null;
  effectRichText?: ExplorationRichTextFragment[] | null;
  metadata: ExplorationResultNarrativeMetadata;
}
