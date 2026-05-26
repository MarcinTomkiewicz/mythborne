import {
  CombatCompletedStageViewInput,
  CombatLiveStageViewInput,
  CombatStageViewModel,
} from '../domain/combat/combat-stage.model';
import {
  mapLiveCombatCenterPanel,
} from './combat-stage-center-panel.mapper';
import {
  combatLiveParticipantCard,
  combatLiveParticipantPair,
} from './combat-stage-participant.mapper';

export function mapLiveCombatStageView(input: CombatLiveStageViewInput): CombatStageViewModel {
  const pair = combatLiveParticipantPair(input.participants);

  return {
    header: input.header,
    ariaLabel: input.ariaLabel,
    leftParticipant: pair.left
      ? combatLiveParticipantCard({
          participant: pair.left,
          badgeLabel: 'Gracz',
          badgeTone: 'success',
        })
      : null,
    rightParticipant: pair.right
      ? combatLiveParticipantCard({
          participant: pair.right,
          badgeLabel: 'Wróg',
          badgeTone: 'danger',
        })
      : null,
    centerPanel: mapLiveCombatCenterPanel({
      ...input,
      heroParticipant: pair.left,
      roundLabel: input.header.roundLabel,
    }),
    emptyParticipants: previewEmptyParticipantState(input.loading.previewFailed),
    log: {
      show: input.log.show,
      title: input.log.title,
      subtitle: input.log.subtitle ?? null,
      emptyText: input.log.emptyText,
      groups: input.log.groups,
    },
  };
}

export function mapCompletedCombatStageView(
  input: CombatCompletedStageViewInput,
): CombatStageViewModel {
  return {
    header: null,
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

function previewEmptyParticipantState(previewFailed: boolean): CombatStageViewModel['emptyParticipants'] {
  return previewFailed
    ? {
        leftTitle: 'Nie udało się odczytać bohatera',
        leftText: 'Podgląd walki nie jest teraz dostępny.',
        rightTitle: 'Nie udało się odczytać przeciwnika',
        rightText: 'Podgląd walki nie jest teraz dostępny.',
      }
    : {
        leftTitle: 'Ładowanie uczestnika',
        leftText: 'Podgląd walki pobiera dane bohatera.',
        rightTitle: 'Ładowanie uczestnika',
        rightText: 'Podgląd walki pobiera dane przeciwnika.',
      };
}
