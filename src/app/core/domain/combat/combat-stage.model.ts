import {
  CombatDisplayLogGroup,
  CombatDisplayParticipant,
  CombatSurfaceDecisionDeadline,
  CombatSurfaceCenterPanel,
} from './combat-display.model';
import {
  CombatLiveParticipantReadModel,
  CombatTimingManifestReadModel,
} from './combat-live.model';
import { CombatSourcePresentation } from './combat-source-presentation.model';

export interface CombatStageLogViewModel {
  show: boolean;
  title: string;
  subtitle: string | null;
  emptyText: string;
  groups: readonly CombatDisplayLogGroup[];
}

export interface CombatStageEmptyParticipantViewModel {
  leftTitle: string | null;
  leftText: string | null;
  rightTitle: string | null;
  rightText: string | null;
}

export interface CombatStageViewModel {
  ariaLabel: string;
  leftParticipant: CombatDisplayParticipant | null;
  rightParticipant: CombatDisplayParticipant | null;
  centerPanel: CombatSurfaceCenterPanel | null;
  emptyParticipants: CombatStageEmptyParticipantViewModel;
  log: CombatStageLogViewModel;
}

export interface CombatLiveCenterPanelInput {
  previewStatus: string | null;
  liveStatusKey: string | null;
  participants: readonly CombatLiveParticipantReadModel[];
  roundLabel: string | null;
  timingManifest: CombatTimingManifestReadModel | null;
  timing: {
    isCombatRunning: boolean;
    walkingPosition: number;
    hitWindow: { start: number; end: number };
    canSubmitStrike: boolean;
  };
  loading: {
    previewFailed: boolean;
    isLoadingPreview: boolean;
    isSubmittingAction: boolean;
    isPreparingSession: boolean;
    isRecoveringState: boolean;
  };
  actions: {
    canShowStartAction: boolean;
    canStartAction: boolean;
    canShowAutoResolveAction: boolean;
    canAutoResolveAction: boolean;
    isAutoResolving: boolean;
  };
  decisionDeadline: CombatSurfaceDecisionDeadline | null;
  sourcePresentation: CombatSourcePresentation;
}

export interface CombatLiveStageViewInput extends Omit<
  CombatLiveCenterPanelInput,
  'roundLabel' | 'participants'
> {
  ariaLabel: string;
  participants: readonly CombatLiveParticipantReadModel[];
  emptyParticipants: CombatStageEmptyParticipantViewModel;
  activeHeroId?: string | null;
  activeHeroPortraitSrc?: string | null;
  log: {
    show: boolean;
    title: string;
    subtitle?: string | null;
    emptyText: string;
    groups: readonly CombatDisplayLogGroup[];
  };
}

export interface CombatCompletedStageViewInput {
  ariaLabel: string;
  leftParticipant: CombatDisplayParticipant | null;
  rightParticipant: CombatDisplayParticipant | null;
  log: {
    title: string;
    subtitle?: string | null;
    emptyText: string;
    groups: readonly CombatDisplayLogGroup[];
  };
  emptyParticipants: CombatStageEmptyParticipantViewModel;
}
