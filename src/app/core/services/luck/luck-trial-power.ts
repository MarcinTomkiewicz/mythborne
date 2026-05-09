import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { TrialPowerRead } from '../../domain/luck/luck.model';
import {
  GetHeroTrialPowerRpcArgs,
  GetHeroTrialPowerRpcRow,
  PreviewLuckInfluenceAndTrialPowerRpcArgs,
  PreviewLuckInfluenceAndTrialPowerRpcRow,
} from '../../types/luck-rpc.types';
import {
  mapTrialPowerRead,
  withTrialPowerStatLabel,
} from '../../utils/luck-mappers';
import { Backend } from '../backend/backend';
import { StatsService } from '../stats/stats';

export interface TrialPowerPreviewInput {
  testedStatKey?: string | null;
  testedStatValue?: number | null;
  luckValue?: number | null;
}

@Injectable({ providedIn: 'root' })
export class LuckTrialPower {
  private readonly backend = inject(Backend);
  private readonly stats = inject(StatsService);

  getHeroTrialPower(
    heroId: string,
    testedStatKey: string,
  ): Observable<TrialPowerRead[]> {
    return forkJoin({
      rows: this.backend.rpc<GetHeroTrialPowerRpcRow[]>(
        RPC.get_hero_trial_power,
        toGetHeroTrialPowerArgs(heroId, testedStatKey),
      ),
      statLabels: this.stats.getStatsLabels(),
    }).pipe(
      map(({ rows, statLabels }) =>
        rows.map((row) => withTrialPowerStatLabel(mapTrialPowerRead(row), statLabels)),
      ),
    );
  }

  previewTrialPower(input: TrialPowerPreviewInput): Observable<TrialPowerRead[]> {
    return forkJoin({
      rows: this.backend.rpc<PreviewLuckInfluenceAndTrialPowerRpcRow[]>(
        RPC.preview_luck_influence_and_trial_power,
        toPreviewTrialPowerArgs(input),
      ),
      statLabels: this.stats.getStatsLabels(),
    }).pipe(
      map(({ rows, statLabels }) =>
        rows.map((row) =>
          withTrialPowerStatLabel(
            mapTrialPowerRead(row),
            statLabels,
            input.testedStatKey ?? null,
          ),
        ),
      ),
    );
  }
}

function toGetHeroTrialPowerArgs(
  heroId: string,
  testedStatKey: string,
): GetHeroTrialPowerRpcArgs {
  return {
    p_hero_id: requiredText(heroId, 'heroId'),
    p_tested_stat_key: requiredText(testedStatKey, 'testedStatKey'),
  };
}

function toPreviewTrialPowerArgs(
  input: TrialPowerPreviewInput,
): PreviewLuckInfluenceAndTrialPowerRpcArgs {
  const args: PreviewLuckInfluenceAndTrialPowerRpcArgs = {};

  addOptionalNonNegativeNumber(args, 'p_tested_stat_value', input.testedStatValue);
  addOptionalNonNegativeNumber(args, 'p_luck_value', input.luckValue);

  return args;
}

function requiredText(value: string, field: string): string {
  const normalized = value.trim();

  if (!normalized) {
    throw new Error(`${field} is required for Trial Power read.`);
  }

  return normalized;
}

function addOptionalNonNegativeNumber<T extends Record<string, unknown>>(
  args: T,
  key: keyof T,
  value: number | null | undefined,
): void {
  if (value === null || value === undefined) {
    return;
  }

  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${String(key)} must be zero or greater for Trial Power preview.`);
  }

  args[key] = value as T[keyof T];
}
