import { Component, computed, inject } from '@angular/core';
import { ENCOUNTER_KIND } from '../../../core/constants/encounter-runtime-keys.const';
import {
  HeroExplorationStepResolutionReadModel,
} from '../../../core/domain/exploration/exploration-runtime.model';
import { jsonRecord, optionalText, read } from '../../../core/utils/json-read';
import { ExplorationPageState } from '../../pages/exploration/exploration-page.state';

type HandoffTone = 'success' | 'info' | 'warn' | 'muted';

interface StepHandoffView {
  iconClass: string;
  badgeLabel: string;
  badgeTone: HandoffTone;
  title: string;
  description: string;
  narrativeTitle: string;
  narrativeLines: string[];
  outcomeTitle: string;
  outcomeDescription: string;
}

@Component({
  selector: 'app-exploration-step-handoff-card',
  standalone: true,
  templateUrl: './exploration-step-handoff-card.html',
  host: { class: 'd-block w-100' },
})
export class ExplorationStepHandoffCard {
  readonly page = inject(ExplorationPageState);
  readonly view = computed(() => this.buildView(this.page.currentStepResult()));

  private buildView(
    result: HeroExplorationStepResolutionReadModel | null,
  ): StepHandoffView | null {
    if (!result) {
      return null;
    }

    const outcome = this.outcome(result);

    return {
      iconClass: this.iconClass(outcome),
      badgeLabel: this.badgeLabel(outcome),
      badgeTone: this.badgeTone(outcome),
      title: this.page.stepResultTitle(),
      description: this.page.stepResultDescription(),
      narrativeTitle: this.narrativeTitle(outcome),
      narrativeLines: this.narrativeLines(result, outcome),
      outcomeTitle: this.outcomeSummaryTitle(outcome),
      outcomeDescription: this.outcomeSummaryDescription(outcome),
    };
  }

  private outcome(result: HeroExplorationStepResolutionReadModel): string {
    if (this.isTrialManifestationFailure(result)) {
      return 'trial-no-manifest';
    }

    if (result.outcomeKind === 'trial') {
      return result.challengeAttemptId ? 'challenge' : 'trial-missing-action';
    }

    if (result.outcomeKind === 'encounter') {
      if (result.challengeAttemptId) {
        return 'challenge';
      }

      return this.encounterKind(result) ?? 'encounter';
    }

    return 'nothing';
  }

  private badgeLabel(outcome: string): string {
    switch (outcome) {
      case 'trial-no-manifest':
        return 'Brak manifestacji';
      case 'challenge':
        return 'Wyzwanie';
      case ENCOUNTER_KIND.resource:
        return 'Zasoby';
      case ENCOUNTER_KIND.buff:
      case ENCOUNTER_KIND.debuff:
        return 'Efekt';
      case 'encounter':
        return 'Spotkanie';
      case 'trial-missing-action':
        return 'Próba';
      default:
        return 'Bez zdarzenia';
    }
  }

  private badgeTone(outcome: string): HandoffTone {
    switch (outcome) {
      case 'challenge':
      case 'trial-missing-action':
        return 'warn';
      case ENCOUNTER_KIND.resource:
      case ENCOUNTER_KIND.buff:
      case ENCOUNTER_KIND.debuff:
      case 'encounter':
        return 'success';
      case 'trial-no-manifest':
        return 'info';
      default:
        return 'muted';
    }
  }

  private iconClass(outcome: string): string {
    switch (outcome) {
      case 'challenge':
      case 'trial-missing-action':
        return 'pi pi-bolt';
      case ENCOUNTER_KIND.resource:
        return 'pi pi-sparkles';
      case ENCOUNTER_KIND.buff:
        return 'pi pi-sphinx';
      case ENCOUNTER_KIND.debuff:
        return 'pi pi-medusa';
      case 'encounter':
        return 'pi pi-compass';
      case 'trial-no-manifest':
        return 'pi pi-minus';
      default:
        return 'pi pi-moon';
    }
  }

  private narrativeTitle(outcome: string): string {
    if (outcome === 'challenge') {
      return 'Wyzwanie stanęło na drodze';
    }

    if (outcome === 'trial-no-manifest') {
      return 'Omen nie przybrał kształtu';
    }

    return 'Co się stało';
  }

  private narrativeLines(
    result: HeroExplorationStepResolutionReadModel,
    outcome: string,
  ): string[] {
    const flavor = this.resultFlavor(result);

    if (flavor) {
      return [flavor, this.defaultNarrative(outcome)];
    }

    return [this.defaultNarrative(outcome)];
  }

  private defaultNarrative(outcome: string): string {
    switch (outcome) {
      case 'trial-no-manifest':
        return 'Na szlaku pojawiła się szansa na próbę, ale znak nie utrzymał się dostatecznie długo. To prawidłowy wynik eksploracji, nie porażka próby.';
      case 'challenge':
        return 'Eksploracja ujawniła wyzwanie. Zanim wybierzesz kolejną ścieżkę, trzeba rozstrzygnąć aktywną próbę lub spotkanie.';
      case ENCOUNTER_KIND.resource:
        return 'Spotkanie zasobowe zostało rozstrzygnięte. Jeśli wyprawa przyniosła łup, jego podsumowanie znajduje się poniżej.';
      case ENCOUNTER_KIND.buff:
        return 'Na szlaku pojawiła się przychylna siła. Zobacz podsumowanie efektu, żeby wiedzieć, co zmieniło się dla bohatera.';
      case ENCOUNTER_KIND.debuff:
        return 'Spotkanie zostawiło na bohaterze niekorzystny ślad. Zobacz podsumowanie efektu, żeby wiedzieć, co teraz utrudnia wyprawę.';
      case 'encounter':
        return 'Spotkanie zostało rozstrzygnięte i wyprawa może przejść do kolejnej decyzji.';
      case 'trial-missing-action':
        return 'Próba zatrzymała wyprawę i czeka na dalsze rozstrzygnięcie.';
      default:
        return 'Szlak był spokojny. Nie pojawiło się spotkanie, efekt ani próba, więc możesz przejść do wyboru kolejnego kierunku.';
    }
  }

  private outcomeSummaryTitle(outcome: string): string {
    switch (outcome) {
      case 'trial-no-manifest':
        return 'Próba się nie ujawniła';
      case 'challenge':
        return 'Pojawiło się wyzwanie';
      case ENCOUNTER_KIND.resource:
        return 'Rozstrzygnięto spotkanie zasobowe';
      case ENCOUNTER_KIND.buff:
      case ENCOUNTER_KIND.debuff:
        return 'Nałożono efekt eksploracji';
      case 'encounter':
        return 'Rozstrzygnięto spotkanie';
      case 'trial-missing-action':
        return 'Próba zatrzymała wyprawę';
      default:
        return 'Szlak pozostał spokojny';
    }
  }

  private outcomeSummaryDescription(outcome: string): string {
    switch (outcome) {
      case 'trial-no-manifest':
        return 'Omen wygasł bez utworzenia aktywnego wyzwania i bez nagrody za próbę.';
      case 'challenge':
        return 'Najpierw rozstrzygnij wyzwanie pokazane poniżej.';
      case ENCOUNTER_KIND.resource:
        return 'Łup, jeśli został przyznany, jest pokazany w podsumowaniu nagrody.';
      case ENCOUNTER_KIND.buff:
        return 'Efekt wzmacniający jest pokazany w podsumowaniu efektu.';
      case ENCOUNTER_KIND.debuff:
        return 'Efekt osłabiający jest pokazany w podsumowaniu efektu.';
      case 'encounter':
        return 'Spotkanie zakończyło się bez dodatkowego wyzwania.';
      case 'trial-missing-action':
        return 'Wyprawa czeka na rozstrzygnięcie próby, zanim będzie można ruszyć dalej.';
      default:
        return 'Brak manifestacji, spotkania, efektu i nagrody jest poprawnym wynikiem pustego kroku.';
    }
  }

  private encounterKind(result: HeroExplorationStepResolutionReadModel): string | null {
    const metadata = jsonRecord(result.metadataJson);

    return result.selectedDefinition?.encounterKind
      ?? optionalText(read(metadata, 'encounterKind', 'encounter_kind'));
  }

  private resultFlavor(result: HeroExplorationStepResolutionReadModel): string | null {
    const metadata = jsonRecord(result.metadataJson);

    return optionalText(read(
      metadata,
      'flavorText',
      'flavor_text',
      'description',
      'descriptionText',
      'description_text',
    ));
  }

  private isTrialManifestationFailure(
    result: HeroExplorationStepResolutionReadModel,
  ): boolean {
    const metadata = jsonRecord(result.metadataJson);

    return (
      result.outcomeKind === 'nothing' &&
      (
        result.rawOutcomeKind === 'trial_opportunity' ||
        read(metadata, 'rawOutcomeKind', 'raw_outcome_kind') === 'trial_opportunity'
      ) &&
      read(metadata, 'trialManifested', 'trial_manifested') === false
    );
  }
}
