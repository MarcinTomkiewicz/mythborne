import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { LuckRngSurface } from '../../domain/luck/luck.model';
import { GetLuckLabPreviewContractsRpcRow } from '../../types/luck-rpc.types';
import { mapLuckRngSurface } from '../../utils/luck-mappers';
import { Backend } from '../backend/backend';

export interface LuckRngSurfaceCategory {
  categoryKey: string;
  surfaces: LuckRngSurface[];
}

@Injectable({ providedIn: 'root' })
export class LuckRngSurfaces {
  private readonly backend = inject(Backend);

  getSurfaces(): Observable<LuckRngSurface[]> {
    return this.backend
      .rpc<GetLuckLabPreviewContractsRpcRow[]>(RPC.get_luck_lab_preview_contracts)
      .pipe(map((rows) => rows.map(mapLuckRngSurface)));
  }

  getSurfaceCategories(): Observable<LuckRngSurfaceCategory[]> {
    return this.getSurfaces().pipe(map(groupSurfacesByCategory));
  }
}

function groupSurfacesByCategory(
  surfaces: LuckRngSurface[],
): LuckRngSurfaceCategory[] {
  const categoryMap = new Map<string, LuckRngSurface[]>();

  for (const surface of surfaces) {
    categoryMap.set(surface.categoryKey, [
      ...(categoryMap.get(surface.categoryKey) ?? []),
      surface,
    ]);
  }

  return [...categoryMap.entries()].map(([categoryKey, categorySurfaces]) => ({
    categoryKey,
    surfaces: categorySurfaces,
  }));
}
