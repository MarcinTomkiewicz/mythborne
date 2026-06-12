import { Component, input, output } from '@angular/core';
import {
  CombatDisplayLogGroup,
  CombatDisplayParticipant,
  CombatSurfaceActionId,
  CombatSurfaceCenterPanel,
  CombatTimingStrikeSnapshot,
} from '../../../core/domain/combat/combat-display.model';
import { CombatCenterPanel } from './combat-center-panel';
import { CombatEmptyParticipantCard } from './combat-empty-participant-card';
import { CombatLogPanel } from './combat-log-panel';
import { CombatParticipantCard } from './combat-participant-card';

@Component({
  selector: 'app-combat-surface',
  standalone: true,
  imports: [CombatCenterPanel, CombatEmptyParticipantCard, CombatParticipantCard, CombatLogPanel],
  templateUrl: './combat-surface.html',
  host: { class: 'd-block w-100' },
})
export class CombatSurface {
  readonly leftParticipant = input<CombatDisplayParticipant | null>(null);
  readonly rightParticipant = input<CombatDisplayParticipant | null>(null);
  readonly logGroups = input<readonly CombatDisplayLogGroup[]>([]);
  readonly showLog = input.required<boolean>();
  readonly logTitle = input.required<string>();
  readonly logSubtitle = input<string | null>(null);
  readonly logEmptyText = input.required<string>();
  readonly ariaLabel = input.required<string>();
  readonly leftEmptyTitle = input.required<string | null>();
  readonly leftEmptyText = input.required<string | null>();
  readonly rightEmptyTitle = input.required<string | null>();
  readonly rightEmptyText = input.required<string | null>();
  readonly centerPanel = input<CombatSurfaceCenterPanel | null>(null);
  readonly centerAction = output<CombatSurfaceActionId>();
  readonly timingStrike = output<CombatTimingStrikeSnapshot>();
}
