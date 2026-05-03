import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import { FormulaAdminData } from '../../domain/formula/formula.model';
import { Row } from '../../types/supabase.types';
import { Backend } from '../backend/backend';
import { EstateAddresses } from '../estate/estate-addresses';
import { FormulaService } from '../formula/formula';
import { Hero } from '../hero/hero';
import { BuildingProgressionService } from '../progression/building-progression';
import { BuildingsService } from './buildings';

describe('BuildingsService', () => {
  let service: BuildingsService;
  let heroService: jasmine.SpyObj<Hero>;
  let estateAddresses: jasmine.SpyObj<EstateAddresses>;
  let backend: jasmine.SpyObj<Backend>;
  let formulaService: jasmine.SpyObj<FormulaService>;

  beforeEach(() => {
    heroService = jasmine.createSpyObj<Hero>('Hero', ['getHeroData']);
    estateAddresses = jasmine.createSpyObj<EstateAddresses>('EstateAddresses', [
      'getCurrentAddress',
    ]);
    backend = jasmine.createSpyObj<Backend>('Backend', ['getAll']);
    formulaService = jasmine.createSpyObj<FormulaService>('FormulaService', ['getAdminData']);

    formulaService.getAdminData.and.returnValue(
      of({} as unknown as FormulaAdminData),
    );
    backend.getAll.and.returnValue(of([]));
    estateAddresses.getCurrentAddress.and.returnValue(of(null));

    TestBed.configureTestingModule({
      providers: [
        BuildingsService,
        { provide: Hero, useValue: heroService },
        { provide: EstateAddresses, useValue: estateAddresses },
        { provide: Backend, useValue: backend },
        { provide: FormulaService, useValue: formulaService },
        { provide: BuildingProgressionService, useValue: {} },
      ],
    });
    service = TestBed.inject(BuildingsService);
  });

  it('does not render a normal mansion view when active hero has no estate', async () => {
    heroService.getHeroData.and.returnValue(of(heroRow(null)));

    await expectAsync(firstValueFrom(service.getMansionEstateView()))
      .toBeRejectedWithError('Active hero does not have an estate address.');

    expect(estateAddresses.getCurrentAddress).not.toHaveBeenCalled();
    expect(backend.getAll).not.toHaveBeenCalled();
  });

  it('does not use district fallback when hero estate address is not readable', async () => {
    heroService.getHeroData.and.returnValue(of(heroRow('estate-1')));

    await expectAsync(firstValueFrom(service.getMansionEstateView()))
      .toBeRejectedWithError('Active hero estate address is not readable.');

    expect(estateAddresses.getCurrentAddress).toHaveBeenCalledWith({
      estateId: 'estate-1',
      heroId: 'hero-1',
      serverId: 'server-1',
    });
    expect(backend.getAll).toHaveBeenCalledWith(jasmine.objectContaining({
      table: TABLES.buildings,
    }));
  });
});

function heroRow(estateId: string | null): Row<'hero'> {
  return {
    id: 'hero-1',
    server_id: 'server-1',
    estate_id: estateId,
  } as Row<'hero'>;
}
