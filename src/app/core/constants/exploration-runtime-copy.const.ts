export const EXPLORATION_RUNTIME_COPY = {
  rewardUnavailable: 'Szczegóły nagrody nie są teraz dostępne.',
  rewardLoadFailed: 'Nie udało się odczytać nagrody eksploracji.',
  rewardEncounterKindMissing:
    'Read model nagrody eksploracji nie zawiera typu encounter.',
  activeHeroLoadFailed: 'Nie udało się odczytać aktywnego bohatera.',
  explorationStatusLoadFailed: 'Nie udało się odczytać statusu eksploracji.',
  movementUnavailableStatus: 'Niedostępna',
  movementBacktrackStatus: 'Powrót',
  movementAvailableStatus: 'Dostępna ścieżka',
  movementLabelMissing: 'Kierunek bez etykiety',
  movementStartRequired: 'Rozpocznij eksplorację przed wyborem kierunku.',
  movementDirectionUnavailable: 'Ten kierunek jest niedostępny.',
  movementStarted: 'Ruch został rozpoczęty.',
  movementStartStepFailed: 'Nie udało się rozpocząć kroku eksploracji.',
  movementActiveChallengeBlock:
    'Rozstrzygnij aktywne wyzwanie przed dalszym ruchem.',
  movementActiveStepBlock: 'Poczekaj na rozstrzygnięcie bieżącego kroku.',
  movementNoAvailableDirections: 'Brak dostępnych kierunków.',
  movementStepKindMissing: 'Ten kierunek nie ma poprawnego rodzaju ruchu.',
  movementBacktrackKindInvalid:
    'Ścieżka powrotu nie ma poprawnego rodzaju ruchu.',
  movementBacktrackEdgeInvalid: 'Ścieżka powrotu ma niepoprawne dane trasy.',
  movementEdgeMissing: 'Ten kierunek nie ma poprawnego połączenia trasy.',
  startDifficultyRequired:
    'Wybierz poziom trudności przed rozpoczęciem eksploracji.',
  startExplorationFailed: 'Nie udało się rozpocząć eksploracji.',
  stepMissingActive: 'Brak aktywnego kroku ruchu do sprawdzenia.',
  stepNotReady: 'Krok ruchu nie jest jeszcze gotowy.',
  stepResolved: 'Wynik ruchu został sprawdzony.',
  stepResolveFailed: 'Nie udało się sprawdzić wyniku ruchu.',
  explorationToastTitle: 'Eksploracja',
  sandboxUnavailable: 'Narzędzie sandbox jest niedostępne dla tego kontekstu.',
  sandboxTitle: 'Sandbox',
  sandboxStepTimerShortened: 'Czas aktywnego kroku został skrócony.',
  sandboxStepTimerFailed: 'Nie udało się skrócić czasu aktywnego kroku.',
  sandboxTrialsAddedPrefix: 'Dodano próby Trial. Aktualnie dostępne:',
  sandboxTrialsFailed: 'Nie udało się dodać prób Trial.',
  sandboxChallengeCompleted: 'Próba została domknięta.',
  sandboxChallengeFailed: 'Nie udało się domknąć próby w sandboxie.',
  sandboxOverrideDiagnostic: 'Sandbox wymusił ten wynik.',
  readinessFilteringDiagnostic:
    'DB odfiltrowała niedostępne opcje przed wyborem wyniku.',
  runtimeSelectionDiagnostic: 'Wynik wybrany przez DB runtime eksploracji.',
  noDefinitionSelected: 'Nie wybrano próby ani spotkania.',
  remainingTrialsOne: 'próba',
  remainingTrialsMany: 'prób',
  remainingTrialsSuffix: 'dostępnych dzisiaj',
  encounterDefinitionSuffix: 'spotkanie',
  skippedDefinitionInfix: 'pominięto:',
  blockingDiagnosticLabel: 'blokujące',
  diagnosticReasonSeparator: ' - ',
  stepDiagnosticRpcLabel: 'RPC',
  stepDiagnosticArgsLabel: 'Argumenty',
  stepDiagnosticMappedResultLabel: 'Zmapowany wynik',
  stepResolutionRpcName: 'resolve_hero_exploration_step',
  unknownLabel: 'Nieznane',
  unknownDefinition: 'nieznana definicja',
  unspecifiedReason: 'brak powodu',
  selectionDiagnosticsTitle: 'Diagnostyka wyboru sandbox',
  selectedDefinitionLabel: 'Wybrano',
  selectedAtLabel: 'Czas',
  finalOutcomeLabel: 'Wynik',
  missingValueLabel: 'N/D',
  rawSelectionDebugPayloadLabel: 'Surowy payload diagnostyki wyboru',
} as const;

export function explorationRemainingTrialsLabel(remaining: number): string {
  const countLabel = remaining === 1
    ? EXPLORATION_RUNTIME_COPY.remainingTrialsOne
    : EXPLORATION_RUNTIME_COPY.remainingTrialsMany;

  return `${remaining} ${countLabel} ${EXPLORATION_RUNTIME_COPY.remainingTrialsSuffix}`;
}
