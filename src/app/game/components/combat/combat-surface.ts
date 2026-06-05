import { Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import {
  CombatDisplayLogGroup,
  CombatDisplayParticipant,
  CombatSurfaceCenterPanel,
  CombatTimingStrikeSnapshot,
} from '../../../core/domain/combat/combat-display.model';
import { CombatLogPanel } from './combat-log-panel';
import { CombatParticipantCard } from './combat-participant-card';
import { WalkingDeadMeter } from './walking-dead-meter';

@Component({
  selector: 'app-combat-surface',
  standalone: true,
  imports: [ButtonModule, CombatParticipantCard, CombatLogPanel, WalkingDeadMeter],
  templateUrl: './combat-surface.html',
  host: { class: 'd-block w-100' },
})
export class CombatSurface {
  readonly leftParticipant = input<CombatDisplayParticipant | null>(null);
  readonly rightParticipant = input<CombatDisplayParticipant | null>(null);
  readonly logGroups = input<readonly CombatDisplayLogGroup[]>([]);
  readonly showLog = input(true);
  readonly logTitle = input('Przebieg starcia');
  readonly logSubtitle = input<string | null>(null);
  readonly logEmptyText = input('Przebieg starcia pojawi się po pierwszej akcji.');
  readonly ariaLabel = input('Walka');
  readonly leftEmptyTitle = input('Ładowanie uczestnika');
  readonly leftEmptyText = input('Podgląd walki pobiera dane bohatera.');
  readonly rightEmptyTitle = input('Ładowanie uczestnika');
  readonly rightEmptyText = input('Podgląd walki pobiera dane przeciwnika.');
  readonly centerPanel = input<CombatSurfaceCenterPanel | null>(null);
  readonly centerAction = output<string>();
  readonly timingStrike = output<CombatTimingStrikeSnapshot>();
}
