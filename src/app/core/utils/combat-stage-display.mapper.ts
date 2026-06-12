import { CombatSurfaceDecisionDeadline } from '../domain/combat/combat-display.model';
import {
  CombatLiveParticipantReadModel,
  CombatLiveStateReadModel,
  CombatResolutionPreviewReadModel,
} from '../domain/combat/combat-live.model';
import {
  CombatCompletedStageViewInput,
  CombatLiveStageViewInput,
  CombatStageEmptyParticipantViewModel,
  CombatStageViewModel,
} from '../domain/combat/combat-stage.model';
import { CombatSourcePresentation } from '../domain/combat/combat-source-presentation.model';
import { mapLiveCombatCenterPanel } from './combat-stage-center-panel.mapper';
import {
  combatLiveParticipantCard,
  combatLiveParticipantPair,
} from './combat-stage-participant.mapper';
import { mapLiveCombatEventLogGroups } from './combat-live-log-display.mapper';

export function mapLiveCombatStageView(input: CombatLiveStageViewInput): CombatStageViewModel {
  const pair = combatLiveParticipantPair(input.participants, input.activeHeroId ?? null);

  return {
    ariaLabel: input.ariaLabel,
    leftParticipant: pair.left
      ? combatLiveParticipantCard({
          participant: pair.left,
          badgeLabel: null,
          badgeTone: 'success',
          activeHeroId: input.activeHeroId ?? null,
          activeHeroPortraitSrc: input.activeHeroPortraitSrc ?? null,
        })
      : null,
    rightParticipant: pair.right
      ? combatLiveParticipantCard({
          participant: pair.right,
          badgeLabel: null,
          badgeTone: 'danger',
          activeHeroId: input.activeHeroId ?? null,
          activeHeroPortraitSrc: input.activeHeroPortraitSrc ?? null,
        })
      : null,
    centerPanel: mapLiveCombatCenterPanel({
      ...input,
      roundLabel: null,
    }),
    emptyParticipants: input.emptyParticipants,
    log: {
      show: input.log.show,
      title: input.log.title,
      subtitle: input.log.subtitle ?? null,
      emptyText: input.log.emptyText,
      groups: input.log.groups,
    },
  };
}

export function mapCombatSessionStageView(input: {
  liveState: CombatLiveStateReadModel | null;
  preview: CombatResolutionPreviewReadModel | null;
  contextTitle: string;
  isLoadingPreview: boolean;
  previewFailed: boolean;
  isPreparingSession: boolean;
  isAutoResolving: boolean;
  isSubmittingAction: boolean;
  walkingPosition: number;
  canSubmitStrike: boolean;
  decisionDeadline?: CombatSurfaceDecisionDeadline | null;
  sourcePresentation: CombatSourcePresentation;
  activeHeroId?: string | null;
  activeHeroPortraitSrc?: string | null;
}): CombatStageViewModel | null {
  const state = input.liveState;
  const preview = input.preview;
  const sourcePresentation = input.sourcePresentation;

  if (!state && !preview && !input.isLoadingPreview && !input.previewFailed) {
    return null;
  }

  return mapLiveCombatStageView({
    ariaLabel: input.contextTitle || sourcePresentation.decision.title,
    participants: state?.participants ?? preview?.participants ?? [],
    emptyParticipants: previewEmptyParticipantState(sourcePresentation, input.previewFailed),
    activeHeroId: input.activeHeroId ?? null,
    activeHeroPortraitSrc: input.activeHeroPortraitSrc ?? null,
    previewStatus: state ? null : preview?.previewStatus ?? null,
    liveStatusKey: state?.statusKey ?? null,
    timingManifest: state?.currentTimingManifest ?? null,
    loading: {
      previewFailed: input.previewFailed,
      isLoadingPreview: input.isLoadingPreview,
      isSubmittingAction: input.isSubmittingAction,
      isPreparingSession: input.isPreparingSession,
      isRecoveringState: false,
    },
    timing: {
      isCombatRunning: Boolean(
        state?.awaitingPlayerAction &&
        state.currentTimingManifest,
      ),
      walkingPosition: input.walkingPosition,
      hitWindow: {
        start: state?.currentTimingManifest?.zoneStartPercent ?? 0,
        end: state?.currentTimingManifest?.zoneEndPercent ?? 0,
      },
      canSubmitStrike: input.canSubmitStrike,
    },
    actions: {
      canShowStartAction: !state && preview?.canStartManual === true,
      canStartAction: !state &&
        preview?.canStartManual === true &&
        !input.isPreparingSession &&
        !input.isAutoResolving,
      canShowAutoResolveAction: !state && preview?.canAutoResolve === true,
      canAutoResolveAction: !state &&
        preview?.canAutoResolve === true &&
        !input.isPreparingSession &&
        !input.isAutoResolving,
      isAutoResolving: input.isAutoResolving,
    },
    decisionDeadline: input.decisionDeadline ?? null,
    sourcePresentation,
    log: {
      show: true,
      title: sourcePresentation.emptyLog.title,
      subtitle: null,
      emptyText: sourcePresentation.emptyLog.text,
      groups: state
        ? mapLiveCombatEventLogGroups(state.events, state.participants)
        : [],
    },
  });
}

export function mapCompletedCombatStageView(
  input: CombatCompletedStageViewInput,
): CombatStageViewModel {
  return {
    ariaLabel: input.ariaLabel,
    leftParticipant: input.leftParticipant,
    rightParticipant: input.rightParticipant,
    centerPanel: null,
    emptyParticipants: input.emptyParticipants,
    log: {
      show: true,
      title: input.log.title,
      subtitle: input.log.subtitle ?? null,
      emptyText: input.log.emptyText,
      groups: input.log.groups,
    },
  };
}

function previewEmptyParticipantState(
  sourcePresentation: CombatSourcePresentation,
  previewFailed: boolean,
): CombatStageEmptyParticipantViewModel {
  if (previewFailed) {
    return sourcePresentation.emptyParticipants.unavailable;
  }

  return sourcePresentation.emptyParticipants.loading ?? {
    leftTitle: null,
    leftText: null,
    rightTitle: null,
    rightText: null,
  };
}
