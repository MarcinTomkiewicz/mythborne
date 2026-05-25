import { Component, computed, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import {
  CombatLiveParticipantReadModel,
  CombatTimingManifestReadModel,
} from '../../../core/domain/combat/combat-live.model';
import {
  mapCombatParticipantBaseStatCardRows,
  mapCombatParticipantStatCardRows,
} from '../../../core/utils/combat-participant-stat-card.mapper';
import { GameBar } from '../../../shared/game-bar/game-bar';
import { StatCard } from '../../../shared/stat-card/stat-card';
import { WalkingDeadMeter } from '../combat/walking-dead-meter';
import { ExplorationChallengeState } from '../../pages/exploration/exploration-challenge.state';
import {
  combatActiveLogGroups,
} from '../../pages/exploration/exploration-live-combat-labels';

@Component({
  selector: 'app-exploration-combat-resolution-card',
  standalone: true,
  imports: [ButtonModule, GameBar, StatCard, WalkingDeadMeter],
  templateUrl: './exploration-combat-resolution-card.html',
  host: { class: 'd-block w-100' },
})
export class ExplorationCombatResolutionCard {
  readonly challenge = inject(ExplorationChallengeState);
  readonly combatResolutionLabel = computed(() =>
    this.challenge.activeChallenge()?.trialDefinitionId
      ? 'Próba bojowa'
      : 'Zasadzka',
  );
  readonly heroParticipant = computed(() =>
    this.challenge.combatParticipants().find((participant) => participant.heroId) ??
    this.challenge.combatParticipants().find((participant) => participant.side === 'initiator') ??
    this.challenge.combatParticipants()[0] ??
    null,
  );
  readonly opponentParticipant = computed(() => {
    const hero = this.heroParticipant();

    return this.challenge.combatParticipants().find((participant) => participant.opponentDefinitionId) ??
      this.challenge.combatParticipants().find((participant) => participant.side === 'defender') ??
      this.challenge.combatParticipants().find((participant) =>
        this.participantUiKey(participant) !== (hero ? this.participantUiKey(hero) : null),
      ) ??
      null;
  });
  readonly isDecisionPreview = computed(() =>
    !this.challenge.combatLiveState() &&
    this.challenge.combatResolutionPreview()?.previewStatus === 'decision_preview',
  );
  readonly actionContextLabel = computed(() =>
    this.isDecisionPreview()
      ? 'Decyzja przed walką'
      : this.challenge.combatRoundLabel(),
  );
  readonly currentActionTitle = computed(() => {
    if (this.isDecisionPreview()) {
      return 'Wybierz sposób rozstrzygnięcia';
    }

    const manifest = this.challenge.combatTimingManifest();
    const actor = this.challenge.currentCombatActor()?.displayName ?? this.heroParticipant()?.displayName;

    return manifest?.label ?? (actor ? `${actor} przygotowuje akcję.` : 'Przygotuj akcję Walking Dead.');
  });
  readonly currentActionHelper = computed(() => {
    if (this.isDecisionPreview()) {
      return 'Rozpocznij walkę ręcznie albo rozstrzygnij ją automatycznie.';
    }

    const state = this.challenge.combatLiveState();
    const manifest = this.challenge.combatTimingManifest();

    if (this.challenge.isSubmittingCombatAction()) {
      return 'Rozstrzyganie akcji.';
    }

    if (this.challenge.isEnsuringCombatSession() || this.challenge.isRecoveringCombatState()) {
      return 'Przygotowanie sesji walki.';
    }

    if (state?.statusKey === 'completed') {
      return 'Walka została zakończona.';
    }

    if (!manifest) {
      return 'Brak aktywnego okna timingu dla gracza.';
    }

    return 'Kliknij tor albo przycisk akcji, gdy wskaźnik przechodzi przez zieloną strefę.';
  });
  readonly timingHelper = computed(() =>
    this.isDecisionPreview()
      ? null
      : this.timingManifestHelper(this.challenge.combatTimingManifest()),
  );
  readonly heroBaseStatRows = computed(() =>
    mapCombatParticipantBaseStatCardRows(this.heroParticipant()?.baseStatRows ?? []),
  );
  readonly heroCombatStatRows = computed(() =>
    mapCombatParticipantStatCardRows(this.heroParticipant()?.combatStatRows ?? []),
  );
  readonly opponentBaseStatRows = computed(() =>
    mapCombatParticipantBaseStatCardRows(this.opponentParticipant()?.baseStatRows ?? []),
  );
  readonly opponentCombatStatRows = computed(() =>
    mapCombatParticipantStatCardRows(this.opponentParticipant()?.combatStatRows ?? []),
  );
  readonly combatLogGroups = computed(() =>
    combatActiveLogGroups(this.challenge.combatEvents(), this.challenge.combatParticipants()),
  );

  hasHp(participant: CombatLiveParticipantReadModel): boolean {
    return participant.currentHp !== null && participant.maxHp !== null;
  }

  hpValue(participant: CombatLiveParticipantReadModel): number {
    return participant.currentHp ?? 0;
  }

  hpMax(participant: CombatLiveParticipantReadModel): number {
    return participant.maxHp ?? 0;
  }

  participantKindLabel(participant: CombatLiveParticipantReadModel): string {
    switch (participant.participantKind?.trim().toLowerCase()) {
      case 'hero':
      case 'player':
        return 'Bohater';
      case 'opponent':
      case 'enemy':
        return 'Przeciwnik';
      default:
        break;
    }

    if (participant.heroId || participant.side === 'initiator') {
      return 'Bohater';
    }

    return 'Przeciwnik';
  }

  participantMeta(participant: CombatLiveParticipantReadModel): string {
    return [
      this.participantKindLabel(participant),
      this.sideLabel(participant),
      participant.statusLabel ?? null,
    ].filter(Boolean).join(' · ');
  }

  sideLabel(participant: CombatLiveParticipantReadModel): string {
    switch (participant.side) {
      case 'initiator':
        return 'Atakujący';
      case 'defender':
        return 'Obrońca';
      default:
        return participant.side ?? 'Strona';
    }
  }

  initials(participant: CombatLiveParticipantReadModel): string {
    const name = participant.displayName;
    const parts = name.trim().split(/\s+/).filter(Boolean);
    const initials = parts.length > 1
      ? `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`
      : name.slice(0, 2);

    return initials.toUpperCase();
  }

  private participantUiKey(participant: CombatLiveParticipantReadModel): string | null {
    return participant.previewParticipantKey ??
      participant.participantKey ??
      participant.side ??
      participant.participantId;
  }

  private timingManifestHelper(manifest: CombatTimingManifestReadModel | null): string | null {
    if (!manifest) {
      return null;
    }

    return [
      manifest.hitChancePercent === null ? null : `Szansa trafienia ${manifest.hitChancePercent}%`,
      manifest.attackIndex === null ? null : `Atak ${manifest.attackIndex}`,
    ].filter(Boolean).join(' · ') || null;
  }

}
