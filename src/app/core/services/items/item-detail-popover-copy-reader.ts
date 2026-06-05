import { inject, Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { map } from 'rxjs/operators';
import { RPC } from '../../constants/rpc.const';
import { ItemDetailPopoverCopy } from '../../domain/item/item-detail-popover.model';
import { Database } from '../../types/database.types';
import { mapItemDetailPopoverCopy } from '../../utils/item-detail-popover-copy.mapper';
import { Backend } from '../backend/backend';

@Injectable({ providedIn: 'root' })
export class ItemDetailPopoverCopyReader {
  private readonly backend = inject(Backend);
  private copy$?: Observable<ItemDetailPopoverCopy>;

  readCopy(): Observable<ItemDetailPopoverCopy> {
    this.copy$ ??= this.backend.rpc<
      Database['public']['Functions']['get_item_detail_popover_copy']['Returns']
    >(
      RPC.get_item_detail_popover_copy,
    ).pipe(
      map((copy) => mapItemDetailPopoverCopy(copy)),
      shareReplay({ bufferSize: 1, refCount: true }),
    );

    return this.copy$;
  }
}
