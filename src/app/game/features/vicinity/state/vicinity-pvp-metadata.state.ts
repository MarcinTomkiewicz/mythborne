import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PVP_TARGETING_SECTION_METADATA_NAMESPACE } from '../../../../core/constants/pvp-ui-metadata.const';
import { UiMetadataEntryReadModel } from '../../../../core/domain/admin-ui-metadata.model';
import { PvpUiMetadata } from '../../../../core/services/pvp/pvp-ui-metadata';
import { getErrorMessage } from '../../../../core/utils/error-message';
import { VicinityRangeState } from './vicinity-range.state';

@Injectable()
export class VicinityPvpMetadataState {
  private readonly destroyRef = inject(DestroyRef);
  private readonly pvpUiMetadata = inject(PvpUiMetadata);
  private readonly range = inject(VicinityRangeState);

  readonly entries = signal<UiMetadataEntryReadModel[]>([]);
  readonly error = signal<string | null>(null);
  readonly loaded = signal(false);

  load(): void {
    this.error.set(null);
    this.loaded.set(false);

    this.pvpUiMetadata.getNamespaceEntries(PVP_TARGETING_SECTION_METADATA_NAMESPACE)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (entries) => {
          this.entries.set(entries);
          this.loaded.set(true);
        },
        error: (error: unknown) => {
          this.entries.set([]);
          this.error.set(
            getErrorMessage(error, this.range.copyJson()?.page.errorLabel ?? ''),
          );
          this.loaded.set(true);
        },
      });
  }
}
