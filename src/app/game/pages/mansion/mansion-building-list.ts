import { Component, inject, input } from '@angular/core';
import type {
  EstateCopyJson,
  EstateRuntimeState,
} from '../../../core/domain/estate/player-estate-page-context.model';
import { MansionPageFacade } from '../../../core/services/buildings/mansion-page.facade';
import { MansionBuildingCard } from './mansion-building-card';

@Component({
  selector: 'app-mansion-building-list',
  standalone: true,
  imports: [MansionBuildingCard],
  templateUrl: './mansion-building-list.html',
})
export class MansionBuildingList {
  readonly page = inject(MansionPageFacade);
  readonly estate = input.required<EstateRuntimeState>();
  readonly copy = input.required<EstateCopyJson>();
}
