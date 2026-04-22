import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { GeneratedItemResult } from '../../domain/item/item-generation.model';
import { ItemGenerationFactory } from '../../factories/item-generation/item-generation.factory';
import { ItemCatalogService } from './item-catalog';

@Injectable({ providedIn: 'root' })
export class ItemGeneratorService {
  private readonly factory = inject(ItemGenerationFactory);
  private readonly catalogService = inject(ItemCatalogService);

  generateItem(luck: number): Observable<GeneratedItemResult> {
    return this.catalogService
      .getCatalog()
      .pipe(map((catalog) => this.factory.generate(luck, catalog)));
  }
}
