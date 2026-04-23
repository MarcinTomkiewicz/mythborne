import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  EditableItemGenerationAffix,
  EditableItemGenerationBase,
  EditableItemGenerationBucketProfile,
  EditableItemGenerationQuality,
  ItemGenerationAdminBalanceData,
  ItemGenerationAdminCatalogData,
} from '../../domain/item/item-generation-admin.model';
import { ItemGenerationBalanceAdminService } from './item-generation-balance-admin';
import { ItemGenerationCatalogAdminService } from './item-generation-catalog-admin';

@Injectable({ providedIn: 'root' })
export class ItemGenerationAdminService {
  private readonly catalog = inject(ItemGenerationCatalogAdminService);
  private readonly balance = inject(ItemGenerationBalanceAdminService);

  getCatalogData(): Observable<ItemGenerationAdminCatalogData> {
    return this.catalog.getData();
  }

  getBalanceData(): Observable<ItemGenerationAdminBalanceData> {
    return this.balance.getData();
  }

  saveQuality(draft: EditableItemGenerationQuality): Observable<void> {
    return this.balance.saveQuality(draft);
  }

  deleteQuality(id: string): Observable<void> {
    return this.balance.deleteQuality(id);
  }

  saveBucketProfile(draft: EditableItemGenerationBucketProfile): Observable<void> {
    return this.balance.saveBucketProfile(draft);
  }

  deleteBucketProfile(id: string): Observable<void> {
    return this.balance.deleteBucketProfile(id);
  }

  saveBase(draft: EditableItemGenerationBase): Observable<void> {
    return this.catalog.saveBase(draft);
  }

  deleteBase(id: string): Observable<void> {
    return this.catalog.deleteBase(id);
  }

  saveAffix(draft: EditableItemGenerationAffix): Observable<void> {
    return this.catalog.saveAffix(draft);
  }

  deleteAffix(id: string): Observable<void> {
    return this.catalog.deleteAffix(id);
  }
}
