export interface CombatSourcePresentation {
  decision: CombatSourceDecisionPresentation;
  loadingPreview: CombatSourcePanelPresentation;
  unavailablePreview: CombatSourcePanelPresentation;
  emptyLog: CombatSourceEmptyLogPresentation;
  emptyParticipants: CombatSourceEmptyParticipantsPresentation;
  live: CombatSourceLivePresentation;
  workflow: CombatSourceWorkflowPresentation;
}

export interface CombatSourceDecisionPresentation {
  eyebrow: string;
  title: string;
  description: string;
  manualActionLabel: string;
  manualActionTooltip: string | null;
  autoActionLabel: string;
  autoActionTooltip: string | null;
  waitingForDecision: string;
}

export interface CombatSourcePanelPresentation {
  title: string;
  text: string;
}

export interface CombatSourceEmptyLogPresentation {
  title: string;
  text: string;
}

export interface CombatSourceEmptyParticipantsPresentation {
  loading: CombatSourceParticipantEmptyStatePresentation | null;
  unavailable: CombatSourceParticipantEmptyStatePresentation;
}

export interface CombatSourceParticipantEmptyStatePresentation {
  leftTitle: string;
  leftText: string;
  rightTitle: string;
  rightText: string;
}

export interface CombatSourceLivePresentation {
  contextLabel: string | null;
  title: string | null;
  helperText: string | null;
  submittingHelperText: string | null;
  preparingHelperText: string | null;
  completedHelperText: string | null;
  timingActionLabel: string | null;
  meterTitle: string | null;
  meterHelperText: string | null;
  meterEarlyLabel: string | null;
  meterHitZoneLabel: string | null;
  meterLateLabel: string | null;
}

export interface CombatSourceWorkflowPresentation {
  finalizingResult: CombatSourcePanelPresentation | null;
  finalizeUnavailable: CombatSourcePanelPresentation | null;
  actionUnavailable: CombatSourcePanelPresentation | null;
}
