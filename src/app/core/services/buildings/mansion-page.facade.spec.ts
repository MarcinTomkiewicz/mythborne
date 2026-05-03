import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MansionEstateView } from '../../domain/building/building.model';
import { BuildingsService } from './buildings';
import { MansionPageFacade } from './mansion-page.facade';

describe('MansionPageFacade', () => {
  let facade: MansionPageFacade;
  let buildingsService: jasmine.SpyObj<BuildingsService>;

  beforeEach(() => {
    buildingsService = jasmine.createSpyObj<BuildingsService>('BuildingsService', [
      'getMansionEstateView',
    ]);
    buildingsService.getMansionEstateView.and.returnValue(of(mansionView()));

    TestBed.configureTestingModule({
      providers: [
        MansionPageFacade,
        { provide: BuildingsService, useValue: buildingsService },
      ],
    });
    facade = TestBed.inject(MansionPageFacade);
  });

  it('loads mansion building state without relocation UI state', () => {
    facade.loadData();

    expect(facade.currentAddress()).toBe('A-3301');
    expect(facade.currentDistrictCode()).toBe('A');
    expect(facade.visibleBuildings()).toEqual([]);

    const exposedKeys = Object.keys(facade as unknown as Record<string, unknown>);
    expect(exposedKeys.some((key) => key.toLowerCase().includes('relocation'))).toBeFalse();
    expect(exposedKeys).not.toContain('relocateEstate');
  });
});

function mansionView(): MansionEstateView {
  return {
    currentAddress: 'A-3301',
    currentDistrictCode: 'A',
    currentDistrictName: 'District A',
    buildings: [],
  };
}
