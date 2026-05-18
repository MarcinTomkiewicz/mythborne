import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ArmoryItemDetailReadModel } from '../../domain/item/item-equipment.model';
import { PlayerArmory } from './player-armory';

@Injectable({ providedIn: 'root' })
export class ItemDetailReader {
  private readonly armory = inject(PlayerArmory);

  readItemDetail(itemId: string): Observable<ArmoryItemDetailReadModel> {
    return this.armory.getArmoryItemDetail(itemId);
  }
}
