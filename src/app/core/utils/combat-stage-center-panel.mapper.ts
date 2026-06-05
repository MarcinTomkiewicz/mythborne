import {
  CombatSurfaceAction,
  CombatSurfaceCenterPanel,
} from '../domain/combat/combat-display.model';
import { CombatTimingManifestReadModel } from '../domain/combat/combat-live.model';
import { CombatLiveCenterPanelInput } from '../domain/combat/combat-stage.model';

export function mapLiveCombatCenterPanel(
  input: CombatLiveCenterPanelInput,
): CombatSurfaceCenterPanel | null {
  const timing = input.timingManifest;
  const footerAction = autoResolveButton(input);

  if (input.loading.isLoadingPreview) {
    return {
      state: 'loading',
      contextLabel: actionContextLabel(input),
      title: 'Ładowanie podglądu walki',
      helperText: 'Uczestnicy i statystyki zostaną pobrane przed decyzją Manual/Auto.',
      footerAction,
    };
  }

  if (input.loading.previewFailed) {
    return {
      state: 'error',
      contextLabel: actionContextLabel(input),
      title: 'Nie udało się odczytać podglądu walki',
      helperText: 'Spróbuj odświeżyć widok po potwierdzeniu stanu serwera gry.',
      footerAction,
    };
  }

  if (input.timing.isCombatRunning && timing) {
    return {
      state: 'live_manual',
      contextLabel: actionContextLabel(input),
      title: currentActionTitle(input),
      helperText: currentActionHelper(input),
      detailText: timingManifestHelper(timing),
      meter: {
        manifestId: timing.manifestId,
        position: input.timing.walkingPosition,
        zoneStart: input.timing.hitWindow.start,
        zoneEnd: input.timing.hitWindow.end,
        disabled: !input.timing.canSubmitStrike,
        actionLabel: 'Zatrzymaj wskaźnik',
        actionLoading: input.loading.isSubmittingAction,
      },
    };
  }

  if (input.actions.canShowStartAction) {
    const secondaryAction = autoResolveButton(input);

    return {
      state: 'decision',
      contextLabel: actionContextLabel(input),
      title: currentActionTitle(input),
      helperText: currentActionHelper(input),
      detailText: timingManifestHelper(timing),
      primaryAction: {
        id: 'start-combat',
        label: 'Walcz ręcznie',
        loading: input.loading.isPreparingSession || input.loading.isRecoveringState,
        disabled: !input.actions.canStartAction,
      },
      secondaryAction,
      decisionDeadline: input.decisionDeadline,
    };
  }

  if (input.actions.canShowTimingAction) {
    return {
      state: 'timing_ready',
      contextLabel: actionContextLabel(input),
      title: currentActionTitle(input),
      helperText: currentActionHelper(input),
      detailText: timingManifestHelper(timing),
      primaryAction: {
        id: 'start-combat',
        label: 'Rozpocznij akcję',
        disabled: !input.actions.canStartAction,
      },
      footerAction,
    };
  }

  if (input.liveStatusKey === 'completed') {
    return null;
  }

  return {
    state: 'idle',
    contextLabel: actionContextLabel(input),
    title: 'Brak okna timingu',
    helperText: 'Akcja Walking Dead pojawi się, gdy stan walki udostępni okno akcji gracza.',
    detailText: timingManifestHelper(timing),
    footerAction,
  };
}

function actionContextLabel(input: CombatLiveCenterPanelInput): string {
  return isDecisionPreview(input)
    ? 'Decyzja przed walką'
    : input.roundLabel ?? 'Runda N/D';
}

function currentActionTitle(input: CombatLiveCenterPanelInput): string {
  if (isDecisionPreview(input)) {
    return 'Wybierz sposób rozstrzygnięcia';
  }

  const actor = input.currentActorName ?? input.heroParticipant?.displayName;

  return input.timingManifest?.label ??
    (actor ? `${actor} przygotowuje akcję.` : 'Przygotuj akcję Walking Dead.');
}

function currentActionHelper(input: CombatLiveCenterPanelInput): string {
  if (isDecisionPreview(input)) {
    return 'Wybierz ręczną walkę albo auto rozstrzygnięcie.';
  }

  if (input.loading.isSubmittingAction) {
    return 'Rozstrzyganie akcji.';
  }

  if (input.loading.isPreparingSession || input.loading.isRecoveringState) {
    return 'Przygotowanie sesji walki.';
  }

  if (input.liveStatusKey === 'completed') {
    return 'Walka została zakończona.';
  }

  if (!input.timingManifest) {
    return 'Brak aktywnego okna timingu dla gracza.';
  }

  return 'Kliknij tor albo przycisk akcji, gdy wskaźnik przechodzi przez zieloną strefę.';
}

function isDecisionPreview(input: CombatLiveCenterPanelInput): boolean {
  return input.liveStatusKey === null && input.previewStatus === 'decision_preview';
}

function autoResolveButton(input: CombatLiveCenterPanelInput): CombatSurfaceAction | null {
  if (input.timing.isCombatRunning || !input.actions.canShowAutoResolveAction) {
    return null;
  }

  return {
    id: 'auto-resolve',
    label: 'Rozstrzygnij auto',
    severity: 'secondary',
    loading: input.actions.isAutoResolving,
    disabled: !input.actions.canAutoResolveAction,
  };
}

function timingManifestHelper(manifest: CombatTimingManifestReadModel | null): string | null {
  if (!manifest) {
    return null;
  }

  return [
    manifest.hitChancePercent === null ? null : `Szansa trafienia ${manifest.hitChancePercent}%`,
    manifest.attackIndex === null ? null : `Atak ${manifest.attackIndex}`,
  ].filter(Boolean).join(' · ') || null;
}
