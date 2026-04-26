import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CombatPageFacade } from '../../../core/services/combat/combat-page.facade';
import { CombatantCard } from '../../components/combat/combatant-card';
import { WalkingDeadMeter } from '../../components/combat/walking-dead-meter';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';

@Component({
  selector: 'app-combat-page',
  standalone: true,
  imports: [CommonModule, ButtonModule, CombatantCard, WalkingDeadMeter, LoadingOverlay],
  providers: [CombatPageFacade],
  templateUrl: './combat-page.html',
})
export class CombatPage implements OnInit {
  readonly page = inject(CombatPageFacade);

  ngOnInit(): void {
    this.page.loadData();
  }
}
