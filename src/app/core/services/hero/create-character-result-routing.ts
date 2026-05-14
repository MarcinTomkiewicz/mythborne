import { getErrorMessage } from '../../utils/error-message';

export function routeForHeroCreationNextAction(nextAction: string): string | null {
  switch (nextAction) {
    case 'stat_allocation':
      return '/hero/attributes';
    case 'dashboard':
    case 'game_shell':
      return '/hero/dashboard';
    default:
      return null;
  }
}

export function toHeroCreationErrorMessage(error: unknown): string {
  const rawMessage = getErrorMessage(error, '');
  const message = rawMessage.toLowerCase();

  if (message.includes('duplicate') || message.includes('already exists') || message.includes('unique')) {
    return 'Ta nazwa bohatera jest już zajęta na wybranym serwerze.';
  }

  if (message.includes('district') && message.includes('full')) {
    return 'Dzielnica startowa na wybranym serwerze jest pełna.';
  }

  if (message.includes('server') && message.includes('full')) {
    return 'Wybrany serwer jest pełny.';
  }

  if (message.includes('origin')) {
    return 'Wybrane pochodzenie jest niedostępne. Wybierz inną opcję.';
  }

  if (
    message.includes('permission') ||
    message.includes('membership') ||
    message.includes('not allowed') ||
    message.includes('unauthorized')
  ) {
    return 'Nie masz uprawnień do stworzenia bohatera na wybranym serwerze.';
  }

  return rawMessage || 'Nie udało się stworzyć bohatera. Sprawdź dane i spróbuj ponownie.';
}
