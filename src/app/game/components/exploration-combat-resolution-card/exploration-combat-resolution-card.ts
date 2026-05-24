import { Component, computed, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import {
  CombatLiveParticipantReadModel,
  CombatTimingManifestReadModel,
} from '../../../core/domain/combat/combat-live.model';
import { GameBar } from '../../../shared/game-bar/game-bar';
import { WalkingDeadMeter } from '../combat/walking-dead-meter';
import { ExplorationChallengeState } from '../../pages/exploration/exploration-challenge.state';

@Component({
  selector: 'app-exploration-combat-resolution-card',
  standalone: true,
  imports: [ButtonModule, GameBar, WalkingDeadMeter],
  templateUrl: './exploration-combat-resolution-card.html',
  styleUrl: './exploration-combat-resolution-card.scss',
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
      this.challenge.combatParticipants().find((participant) => participant.participantId !== hero?.participantId) ??
      null;
  });
  readonly currentActionTitle = computed(() => {
    const manifest = this.challenge.combatTimingManifest();
    const actor = this.challenge.currentCombatActor()?.displayName ?? this.heroParticipant()?.displayName;

    return manifest?.label ?? (actor ? `${actor} przygotowuje akcję.` : 'Przygotuj akcję Walking Dead.');
  });
  readonly currentActionHelper = computed(() => {
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
    this.timingManifestHelper(this.challenge.combatTimingManifest()),
  );

  hpValue(participant: CombatLiveParticipantReadModel | null): number {
    return participant?.currentHp ?? 0;
  }

  hpMax(participant: CombatLiveParticipantReadModel | null): number {
    return participant?.maxHp ?? 0;
  }

  hpLabel(participant: CombatLiveParticipantReadModel | null): string {
    return participant ? this.challenge.participantHpLabel(participant) : 'N/D';
  }

  participantKindLabel(participant: CombatLiveParticipantReadModel | null): string {
    if (!participant) {
      return 'Uczestnik';
    }

    return participant.heroId ? 'Bohater' : 'Przeciwnik';
  }

  participantMeta(participant: CombatLiveParticipantReadModel | null): string {
    if (!participant) {
      return 'Oczekiwanie na stan walki';
    }

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

  initials(participant: CombatLiveParticipantReadModel | null): string {
    const name = participant?.displayName ?? '?';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    const initials = parts.length > 1
      ? `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`
      : name.slice(0, 2);

    return initials.toUpperCase();
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
