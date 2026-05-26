import {
  CombatDisplayLogGroup,
  CombatDisplayParticipant,
  CombatSurfaceCenterPanel,
} from './combat-display.model';
import {
  CombatLiveParticipantReadModel,
  CombatTimingManifestReadModel,
} from './combat-live.model';

export interface CombatStageHeaderViewModel {
  label: string;
  title: string;
  modeBadgeLabel: string;
  statusLabel: string | null;
  roundLabel: string | null;
  waitingLabel: string;
}

export interface CombatStageLogViewModel {
  show: boolean;
  title: string;
  subtitle: string | null;
  emptyText: string;
  groups: readonly CombatDisplayLogGroup[];
}

export interface CombatStageEmptyParticipantViewModel {
  leftTitle: string;
  leftText: string;
  rightTitle: string;
  rightText: string;
}

export interface CombatStageViewModel {
  header: CombatStageHeaderViewModel | null;
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
  roundLabel: string | null;
  currentActorName: string | null;
  heroParticipant: CombatLiveParticipantReadModel | null;
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
    canShowTimingAction: boolean;
    canShowAutoResolveAction: boolean;
    canAutoResolveAction: boolean;
    isAutoResolving: boolean;
  };
}

export interface CombatLiveStageViewInput extends Omit<
  CombatLiveCenterPanelInput,
  'heroParticipant' | 'roundLabel'
> {
  header: CombatStageHeaderViewModel;
  ariaLabel: string;
  participants: readonly CombatLiveParticipantReadModel[];
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
