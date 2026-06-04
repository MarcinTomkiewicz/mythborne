import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { VICINITY_ADDRESS_PAGE_SIZE } from '../../../../core/configs/vicinity.config';
import {
  buildPlayerVicinityBrowserRange,
} from '../../../../core/utils/player-vicinity-address.mapper';
import type { VicinityBrowserRangeResult } from '../../../../core/types/vicinity.types';
import { PlayerVicinity } from '../../../../core/services/vicinity/player-vicinity';

@Injectable({ providedIn: 'root' })
export class VicinityBrowserRangeLoader {
  private readonly playerVicinity = inject(PlayerVicinity);

  load(options: {
    selectedDistrictCode: string | null;
    focusAddressNumber: number;
    useExistingSelection?: boolean;
  }): Observable<VicinityBrowserRangeResult> {
    return this.playerVicinity.getPageContext().pipe(
      map((context) => buildPlayerVicinityBrowserRange({
        context,
        selectedDistrictCode: options.selectedDistrictCode,
        focusAddressNumber: options.focusAddressNumber,
        useExistingSelection: options.useExistingSelection,
        pageSize: VICINITY_ADDRESS_PAGE_SIZE,
      })),
    );
  }
}
