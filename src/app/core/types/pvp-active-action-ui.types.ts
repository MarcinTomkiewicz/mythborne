export interface PvpActiveActionPanelCopy {
  activeSpyAriaLabel: string;
  activeActionAriaLabel: string;
  activeActionEyebrow: string;
  spyTitle: string;
  remainingTimeLabel: string;
  spyProgressLabel: string;
  spyTimerUpdatingText: string;
  spyDetailsAriaLabel: string;
  timerAriaLabel: string;
  progressAriaLabel: string;
  pendingNeutralHelperText: string;
  readyLabel: string;
  resolvedReadyTitle: string;
  arrivalReadyTitle: string;
  resolvedReadyHelperText: string;
  arrivalReadyHelperText: string;
  refreshActionLabel: string;
  decorativeLabel: string;
  activeDetailsAriaLabel: string;
}

export interface PvpActiveActionStateCopy {
  missingActiveHeroError: string;
  startedSpyOfferMissingError: string;
  spyReturningPhaseError: string;
  spyReportMissingResultError: string;
  spyReportPrepareFailedError: string;
}

export interface ExpectedPvpActiveActionOffer {
  actionKind: 'spy';
  pvpActionId: string;
}

export interface PvpActiveActionUiCopy {
  panel: PvpActiveActionPanelCopy;
  state: PvpActiveActionStateCopy;
}
