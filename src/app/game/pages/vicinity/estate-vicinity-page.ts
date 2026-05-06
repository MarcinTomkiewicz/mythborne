import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PVP_TARGETING_SECTION_METADATA_NAMESPACE } from '../../../core/constants/pvp-ui-metadata.const';
import { UiMetadataEntryReadModel } from '../../../core/domain/admin-ui-metadata.model';
import { PvpUiMetadata } from '../../../core/services/pvp/pvp-ui-metadata';
import { getErrorMessage } from '../../../core/utils/error-message';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { EstateVicinityPageState } from './estate-vicinity-page.state';
import { VicinityTargetCandidatesState } from './vicinity-target-candidates.state';
import { VicinityPvpTargetCard } from './vicinity-pvp-target-card';
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
    VicinityPvpTargetCard,
  ],
  providers: [
    EstateVicinityPageState,
    VicinityRelocationRunner,
    VicinityTargetCandidatesState,
  ],
  templateUrl: './estate-vicinity-page.html',
})
export class EstateVicinityPage implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly pvpUiMetadata = inject(PvpUiMetadata);

  readonly page = inject(EstateVicinityPageState);
  readonly pvpTargets = inject(VicinityTargetCandidatesState);
  readonly pvpTargetingMetadata = signal<UiMetadataEntryReadModel[]>([]);
  readonly pvpTargetingMetadataError = signal<string | null>(null);

  ngOnInit(): void {
    this.page.loadData();
    this.pvpTargets.loadActiveRuntimeActivity();
    this.pvpTargets.loadCandidates();
    this.loadPvpTargetingMetadata();
  }

  private loadPvpTargetingMetadata(): void {
    this.pvpTargetingMetadataError.set(null);

    this.pvpUiMetadata.getNamespaceEntries(PVP_TARGETING_SECTION_METADATA_NAMESPACE)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (entries) => {
          this.pvpTargetingMetadata.set(entries);
        },
        error: (error: unknown) => {
          this.pvpTargetingMetadata.set([]);
          this.pvpTargetingMetadataError.set(
            getErrorMessage(error, 'Failed to load PvP targeting metadata.'),
          );
        },
      });
  }
}
