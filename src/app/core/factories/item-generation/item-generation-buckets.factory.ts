import { Injectable } from '@angular/core';
import { ItemGenerationBucketProfile } from '../../domain/item/item-generation.model';

@Injectable({ providedIn: 'root' })
export class ItemGenerationBucketsFactory {
  buildBuckets(profile: ItemGenerationBucketProfile): number[] {
    const buckets: number[] = [];

    for (let index = 0; index < profile.bucketCount; index++) {
      const rawValue =
        profile.baseValue * Math.pow(profile.growthFactor, index) +
        profile.linearGrowth * index;
      const roundedValue = this.roundToStep(rawValue, profile.roundingStep);
      const previousValue = buckets[index - 1] ?? 0;
      const minimumNextValue =
        index === 0
          ? this.roundToStep(profile.baseValue, profile.roundingStep)
          : previousValue + profile.minIncrement;

      buckets.push(Math.max(minimumNextValue, roundedValue));
    }

    return buckets;
  }

  private roundToStep(value: number, step: number): number {
    return Math.max(step, Math.round(value / step) * step);
  }
}
