import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import {
  PvpActionEligibility,
  PvpTargetCandidate,
} from '../../../core/domain/pvp/pvp.model';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { EstateVicinityPageState } from './estate-vicinity-page.state';
import { VicinityTargetCandidatesState } from './vicinity-target-candidates.state';
import { VicinityRelocationRunner } from './vicinity-relocation-runner';

@Component({
  selector: 'app-estate-vicinity-page',
  standalone: true,
  imports: [
    ButtonModule,
    CheckboxModule,
    FormsModule,
    InputTextModule,
    LoadingOverlay,
    RouterLink,
  ],
  providers: [
    EstateVicinityPageState,
    VicinityRelocationRunner,
    VicinityTargetCandidatesState,
  ],
  templateUrl: './estate-vicinity-page.html',
})
export class EstateVicinityPage implements OnInit {
  readonly page = inject(EstateVicinityPageState);
  readonly pvpTargets = inject(VicinityTargetCandidatesState);

  ngOnInit(): void {
    this.page.loadData();
    this.pvpTargets.loadCandidates();
  }

  durationLabel(seconds: number): string {
    if (seconds < 60) {
      return `${seconds}s`;
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return remainingSeconds > 0
      ? `${minutes}m ${remainingSeconds}s`
      : `${minutes}m`;
  }

  protectionLabel(candidate: PvpTargetCandidate): string {
    if (!candidate.underProtection) {
      return 'No active protection';
    }

    return candidate.protectionExpiresAt
      ? `Protected until ${new Date(candidate.protectionExpiresAt).toLocaleString()}`
      : 'Protected';
  }

  eligibilityLabel(eligibility: PvpActionEligibility): string {
    return eligibility.canStart ? 'Available' : 'Unavailable';
  }

  eligibilityBadgeClass(eligibility: PvpActionEligibility): string {
    return eligibility.canStart
      ? 'tag-badge tag-badge--info'
      : 'tag-badge tag-badge--muted';
  }
}
