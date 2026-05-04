import { TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
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
    expect(facade.activeBuildingJob()).toBeNull();
    expect(facade.recentBuildingJobs()).toEqual([]);
    expect(facade.finalizedBuildingJobsCount()).toBe(0);
    expect(facade.visibleBuildings()).toEqual([]);

    const exposedKeys = Object.keys(facade as unknown as Record<string, unknown>);
    expect(exposedKeys.some((key) => key.toLowerCase().includes('relocation'))).toBeFalse();
    expect(exposedKeys).not.toContain('relocateEstate');
  });

  it('ignores stale mansion responses from an earlier load request', () => {
    const first = new Subject<MansionEstateView>();
    const second = new Subject<MansionEstateView>();
    buildingsService.getMansionEstateView.and.returnValues(
      first.asObservable(),
      second.asObservable(),
    );

    facade.loadData();
    facade.loadData();
    second.next({
      ...mansionView(),
      currentAddress: 'A-3302',
    });
    first.next({
      ...mansionView(),
      currentAddress: 'A-3301',
    });

    expect(facade.currentAddress()).toBe('A-3302');
  });
});

function mansionView(): MansionEstateView {
  return {
    heroId: 'hero-1',
    serverId: 'server-1',
    currentAddress: 'A-3301',
    currentDistrictCode: 'A',
    currentDistrictName: 'District A',
    activeBuildingJob: null,
    recentBuildingJobs: [],
    finalizedBuildingJobsCount: 0,
    buildings: [],
  };
}
