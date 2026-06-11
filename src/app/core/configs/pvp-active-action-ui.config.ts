import {
  SUPABASE_ASSET_IMAGE_TRANSFORMS,
  supabaseStorageCssImageUrl,
} from '../config/storage-assets.config';
import type { PvpActiveActionUiCopy } from '../types/pvp-active-action-ui.types';

export const PVP_SPY_BACKGROUND_SOURCE = 'pvp-spy';

export const PVP_SPY_BACKGROUND_IMAGE = supabaseStorageCssImageUrl(
  'backgrounds/spy-background.png',
  SUPABASE_ASSET_IMAGE_TRANSFORMS.background,
);

export const PVP_ACTIVE_ACTION_COPY: PvpActiveActionUiCopy = {
  panel: {
    activeSpyAriaLabel: 'Aktywne szpiegowanie',
    activeActionAriaLabel: 'Aktywna akcja PvP',
    activeActionEyebrow: 'Aktywna akcja PvP',
    spyTitle: 'Szpiegowanie',
    remainingTimeLabel: 'Pozostały czas',
    spyProgressLabel: 'Postęp szpiegowania',
    spyTimerUpdatingText: 'Aktualizujemy czas aktywnego szpiegowania.',
    spyDetailsAriaLabel: 'Szczegóły szpiegowania',
    timerAriaLabel: 'Czas aktywnej akcji PvP',
    progressAriaLabel: 'Postęp aktywnej akcji PvP',
    pendingNeutralHelperText: 'Aktualizujemy stan aktywnej akcji PvP.',
    readyLabel: 'Akcja gotowa',
    resolvedReadyTitle: 'Powrót dostępny',
    arrivalReadyTitle: 'Dotarcie zakończone',
    resolvedReadyHelperText: 'Odśwież stan, aby sprawdzić dostępność bohatera.',
    arrivalReadyHelperText: 'Dalsza obsługa odbywa się poza listą celów.',
    refreshActionLabel: 'Odśwież',
    decorativeLabel: 'PvP',
    activeDetailsAriaLabel: 'Szczegóły aktywnej akcji PvP',
  },
  state: {
    missingActiveHeroError: 'Brak aktywnego bohatera do obsługi akcji PvP.',
    startedSpyOfferMissingError: 'Nie udało się potwierdzić rozpoczętego szpiegowania.',
    spyReturningPhaseError: 'Nie udało się odświeżyć stanu szpiegowania.',
    spyReportMissingResultError: 'Szpiegowanie zakończone, ale raport nie jest jeszcze dostępny.',
    spyReportPrepareFailedError: 'Nie udało się przygotować raportu szpiegowania.',
  },
};
