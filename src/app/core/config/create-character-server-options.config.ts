import {
  CreateCharacterOriginCreationSummaryRowConfig,
  CreateCharacterOriginSelectedSummaryRowConfig,
} from '../interfaces/hero/create-character-origin-summary.interface';

export const DISTRICT_A_FULL_BLOCKER =
  'Brak wolnych posiadłości startowych w Dzielnicy A.';
export const STANDARD_SINGLE_HERO_BLOCKER =
  'Na świecie standardowym możesz mieć tylko jednego bohatera. Wejdź do gry istniejącym bohaterem.';

export const CREATE_CHARACTER_AVAILABILITY_MISSING =
  'Nie udało się potwierdzić dostępności wybranego serwera.';
export const CREATE_CHARACTER_CREATION_AVAILABLE = 'Tworzenie dostępne';
export const CREATE_CHARACTER_CREATION_UNAVAILABLE = 'Tworzenie niedostępne';
export const CREATE_CHARACTER_MISSING_BLOCKER =
  'Tworzenie bohatera jest teraz niedostępne na tym świecie.';
export const CREATE_CHARACTER_NO_FREE_SLOTS = 'Brak wolnych miejsc';
export const CREATE_CHARACTER_CHOOSE_SERVER_AVAILABILITY =
  'Wybierz świat, aby sprawdzić dostępność tworzenia.';
export const CREATE_CHARACTER_ENTRY_ROUTE_CONTRACT_GAP =
  'Wejście do gry jest teraz niedostępne';

export const CREATE_CHARACTER_ENTRY_ROUTE_LABELS: Record<string, string> = {
  create_hero: 'Tworzenie bohatera',
  dashboard: 'Panel istniejącego bohatera',
  game_shell: 'Wejście do gry istniejącym bohaterem',
  enter_game: 'Wejście do gry istniejącym bohaterem',
  hero_selection: 'Wybór bohatera',
  blocked: 'Wejście zablokowane',
};

export const CREATE_CHARACTER_STARTING_CHARACTER_POINTS = 1000;

export const CREATE_CHARACTER_ORIGIN_CREATION_SUMMARY_ROWS: readonly CreateCharacterOriginCreationSummaryRowConfig[] = [
  {
    key: 'server',
    label: 'Serwer',
    primary: true,
  },
  {
    key: 'heroName',
    label: 'Imię bohatera',
  },
  {
    key: 'origin',
    label: 'Pochodzenie',
  },
  {
    key: 'characterPoints',
    label: 'Punkty postaci',
  },
  {
    key: 'estate',
    label: 'Posiadłość',
    multiline: true,
  },
];

export const CREATE_CHARACTER_ORIGIN_SELECTED_SUMMARY_ROWS: readonly CreateCharacterOriginSelectedSummaryRowConfig[] = [
  {
    key: 'origin',
    label: 'Pochodzenie',
    primary: true,
  },
  {
    key: 'bonuses',
    label: 'Bonusy',
    multiline: true,
  },
];
