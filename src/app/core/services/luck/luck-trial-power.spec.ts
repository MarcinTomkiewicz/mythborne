import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import {
  GetHeroTrialPowerRpcRow,
  PreviewLuckInfluenceAndTrialPowerRpcRow,
} from '../../types/luck-rpc.types';
import { Backend } from '../backend/backend';
import { StatsService } from '../stats/stats';
import { LuckTrialPower } from './luck-trial-power';

describe('LuckTrialPower', () => {
  let backend: jasmine.SpyObj<Backend>;
  let stats: jasmine.SpyObj<StatsService>;
  let service: LuckTrialPower;

  beforeEach(() => {
    backend = jasmine.createSpyObj<Backend>('Backend', ['rpc']);
    stats = jasmine.createSpyObj<StatsService>('StatsService', ['getStatsLabels']);
    stats.getStatsLabels.and.returnValue(of({
      wisdom: 'Wisdom',
      spirituality: 'Spirituality',
    }));

    TestBed.configureTestingModule({
      providers: [
        LuckTrialPower,
        { provide: Backend, useValue: backend },
        { provide: StatsService, useValue: stats },
      ],
    });

    service = TestBed.inject(LuckTrialPower);
  });

  it('loads hero Trial Power from the DB-owned read helper and labels the tested stat', async () => {
    backend.rpc.and.returnValue(of([heroTrialPowerRow()]));

    const result = await firstValueFrom(
      service.getHeroTrialPower('hero-1', 'wisdom'),
    );

    expect(backend.rpc).toHaveBeenCalledWith(RPC.get_hero_trial_power, {
      p_hero_id: 'hero-1',
      p_tested_stat_key: 'wisdom',
    });
    expect(stats.getStatsLabels).toHaveBeenCalled();
    expect(result[0]).toEqual(jasmine.objectContaining({
      heroId: 'hero-1',
      testedStatKey: 'wisdom',
      testedStatLabel: 'Wisdom',
      testedStatValue: 40,
      luckValue: 21,
      luckInfluence: 7,
      trialPower: 47,
    }));
  });

  it('previews Trial Power through the DB preview RPC without sending stat key as formula input', async () => {
    backend.rpc.and.returnValue(of([trialPowerPreviewRow()]));

    const result = await firstValueFrom(
      service.previewTrialPower({
        testedStatKey: 'spirituality',
        testedStatValue: 30,
        luckValue: 15,
      }),
    );

    expect(backend.rpc).toHaveBeenCalledWith(
      RPC.preview_luck_influence_and_trial_power,
      {
        p_tested_stat_value: 30,
        p_luck_value: 15,
      },
    );
    expect(result[0].testedStatKey).toBe('spirituality');
    expect(result[0].testedStatLabel).toBe('Spirituality');
    expect(result[0].luckValue).toBe(15);
    expect(result[0].luckInfluence).toBe(5);
    expect(result[0].trialPower).toBe(35);
    expect(result[0].trialPowerFormula?.formulaKey).toBe('trial_power');
  });

  it('rejects invalid preview values before calling the RPC', () => {
    expect(() =>
      service.previewTrialPower({ testedStatValue: -1 }).subscribe(),
    ).toThrowError('p_tested_stat_value must be zero or greater for Trial Power preview.');
    expect(backend.rpc).not.toHaveBeenCalled();
  });
});

function heroTrialPowerRow(): GetHeroTrialPowerRpcRow {
  return {
    hero_id: 'hero-1',
    tested_stat_key: 'wisdom',
    tested_stat_value: 40,
    luck_value: 21,
    luck_influence: 7,
    trial_power: 47,
  };
}

function trialPowerPreviewRow(): PreviewLuckInfluenceAndTrialPowerRpcRow {
  return {
    explanation: 'DB-owned Trial Power preview.',
    luck_influence: 5,
    luck_influence_expression: 'luck formula',
    luck_influence_formula_key: 'luck_influence',
    luck_value: 15,
    tested_stat_value: 30,
    trial_power: 35,
    trial_power_expression: 'trial power formula',
    trial_power_formula_key: 'trial_power',
  };
}
