import { TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import {
  CurrentEstateAddressReadModel,
  EstateDistrictCapacityReadModel,
  OccupiedEstateAddressReadModel,
} from '../../../core/domain/estate/estate-address.model';
import { EstateRelocationResult } from '../../../core/domain/estate/estate-relocation.model';
import { EstateAddresses } from '../../../core/services/estate/estate-addresses';
import { EstateRelocation } from '../../../core/services/estate/estate-relocation';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { ToastService } from '../../../core/services/ui/toast';
import { EstateVicinityPageState } from './estate-vicinity-page.state';
import { VicinityRelocationRunner } from './vicinity-relocation-runner';

describe('EstateVicinityPageState', () => {
  let state: EstateVicinityPageState;
  let activeHero: jasmine.SpyObj<ActiveHero>;
  let estateAddresses: jasmine.SpyObj<EstateAddresses>;
  let estateRelocation: jasmine.SpyObj<EstateRelocation>;
  let toast: jasmine.SpyObj<ToastService>;

  beforeEach(() => {
    activeHero = jasmine.createSpyObj<ActiveHero>('ActiveHero', ['requireActiveHero']);
    estateAddresses = jasmine.createSpyObj<EstateAddresses>('EstateAddresses', [
      'getActiveHeroCurrentAddress',
      'getDistrictCapacities',
      'getOccupiedAddressesForAddressNumberRange',
    ]);
    estateRelocation = jasmine.createSpyObj<EstateRelocation>('EstateRelocation', [
      'relocateActiveHeroEstate',
    ]);
    toast = jasmine.createSpyObj<ToastService>('ToastService', ['show']);

    activeHero.requireActiveHero.and.returnValue(of({
      heroRow: { id: 'hero-1' } as never,
      heroId: 'hero-1',
      hero: {} as never,
      userId: 'user-1',
      serverId: 'server-1',
      server: {} as never,
    }));
    estateAddresses.getActiveHeroCurrentAddress.and.returnValue(of(currentAddress(3301)));
    estateAddresses.getDistrictCapacities.and.returnValue(of([
      district('A', 5000),
      district('B', 3000),
    ]));
    estateAddresses.getOccupiedAddressesForAddressNumberRange.and.returnValue(of([
      occupiedAddress(3299),
      occupiedAddress(3304),
    ]));
    estateRelocation.relocateActiveHeroEstate.and.returnValue(of(relocationResult()));

    TestBed.configureTestingModule({
      providers: [
        EstateVicinityPageState,
        VicinityRelocationRunner,
        { provide: ActiveHero, useValue: activeHero },
        { provide: EstateAddresses, useValue: estateAddresses },
        { provide: EstateRelocation, useValue: estateRelocation },
        { provide: ToastService, useValue: toast },
      ],
    });
    state = TestBed.inject(EstateVicinityPageState);
  });

  it('loads vicinity around the current estate address', () => {
    state.loadData();

    expect(estateAddresses.getOccupiedAddressesForAddressNumberRange).toHaveBeenCalledWith({
      serverId: 'server-1',
      districtCode: 'A',
      fromAddressNumber: 3291,
      toAddressNumber: 3311,
    });
    expect(state.currentAddressLabel()).toBe('A-3301');
    expect(state.rangeLabel()).toBe('A-3291 - A-3311');
    expect(state.selectedDistrictCode()).toBe('A');
    expect(state.selectedDistrictCapacityLabel()).toBe('5000 addresses');
    expect(state.rows().find((row) => row.addressNumber === 3301)?.kind).toBe('self');
    expect(state.rows().find((row) => row.addressNumber === 3299)?.kind).toBe('occupied');
    expect(state.rows().find((row) => row.addressNumber === 3299)?.isSelectable).toBeFalse();
    expect(state.rows().find((row) => row.addressNumber === 3300)?.kind).toBe('empty');
    expect(state.rows().find((row) => row.addressNumber === 3300)?.isSelectable).toBeTrue();
  });

  it('shows an invariant error when the active hero has no current estate address', () => {
    estateAddresses.getActiveHeroCurrentAddress.and.returnValue(of(null));

    state.loadData();

    expect(estateAddresses.getOccupiedAddressesForAddressNumberRange).not.toHaveBeenCalled();
    expect(state.isLoading()).toBeFalse();
    expect(state.currentAddress()).toBeNull();
    expect(state.vicinityRange()).toBeNull();
    expect(state.error()).toBe('Active hero does not have an estate address.');
  });

  it('ignores stale initial vicinity load responses', () => {
    const staleOccupied = new Subject<OccupiedEstateAddressReadModel[]>();
    const currentOccupied = new Subject<OccupiedEstateAddressReadModel[]>();

    estateAddresses.getOccupiedAddressesForAddressNumberRange.and.returnValues(
      staleOccupied.asObservable(),
      currentOccupied.asObservable(),
    );

    state.loadData();
    state.loadData();

    currentOccupied.next([]);
    currentOccupied.complete();

    expect(state.isLoading()).toBeFalse();
    expect(state.rows().find((row) => row.addressNumber === 3299)?.kind).toBe('empty');

    staleOccupied.next([occupiedAddress(3299)]);
    staleOccupied.complete();

    expect(state.rows().find((row) => row.addressNumber === 3299)?.kind).toBe('empty');
    expect(state.error()).toBeNull();
  });

  it('browses another district without rendering the current estate as self', () => {
    state.loadData();

    estateAddresses.getOccupiedAddressesForAddressNumberRange.and.returnValue(of([
      {
        ...occupiedAddress(3),
        districtCode: 'B',
        addressLabel: 'B-3',
      },
    ]));
    state.setSelectedDistrictCode('B');

    expect(estateAddresses.getOccupiedAddressesForAddressNumberRange).toHaveBeenCalledWith({
      serverId: 'server-1',
      districtCode: 'B',
      fromAddressNumber: 1,
      toAddressNumber: 11,
    });
    expect(state.selectedDistrictCode()).toBe('B');
    expect(state.rangeLabel()).toBe('B-1 - B-11');
    expect(state.rows().some((row) => row.kind === 'self')).toBeFalse();
    expect(state.rows().find((row) => row.addressNumber === 3)?.kind).toBe('occupied');
  });

  it('filters visible vicinity rows without changing the source range', () => {
    state.loadData();

    state.setKindFilter('empty');
    expect(state.visibleRows().every((row) => row.kind === 'empty')).toBeTrue();
    expect(state.visibleRows().some((row) => row.kind === 'occupied')).toBeFalse();

    state.setKindFilter('occupied');
    expect(state.visibleRows().map((row) => row.kind)).toEqual([
      'occupied',
      'self',
      'occupied',
    ]);

    state.setKindFilter('all');
    expect(state.visibleRows().length).toBe(state.rows().length);
  });

  it('loads a compact address range around a selected center address', () => {
    state.loadData();

    estateAddresses.getOccupiedAddressesForAddressNumberRange.and.returnValue(of([]));
    state.setCenterAddressInput('4500');
    state.applyCenterAddress();

    expect(estateAddresses.getOccupiedAddressesForAddressNumberRange).toHaveBeenCalledWith({
      serverId: 'server-1',
      districtCode: 'A',
      fromAddressNumber: 4490,
      toAddressNumber: 4510,
    });
    expect(state.centerAddressNumber()).toBe(4500);
    expect(state.rangeLabel()).toBe('A-4490 - A-4510');
    expect(state.rows().length).toBe(21);
  });

  it('ignores stale selected range reload responses after center changes', () => {
    state.loadData();

    const staleOccupied = new Subject<OccupiedEstateAddressReadModel[]>();
    const currentOccupied = new Subject<OccupiedEstateAddressReadModel[]>();

    estateAddresses.getOccupiedAddressesForAddressNumberRange.and.returnValues(
      staleOccupied.asObservable(),
      currentOccupied.asObservable(),
    );

    state.setCenterAddressInput('4500');
    state.applyCenterAddress();
    state.setCenterAddressInput('4600');
    state.applyCenterAddress();

    currentOccupied.next([]);
    currentOccupied.complete();

    expect(state.centerAddressNumber()).toBe(4600);
    expect(state.rangeLabel()).toBe('A-4590 - A-4610');

    staleOccupied.next([occupiedAddress(4500)]);
    staleOccupied.complete();

    expect(state.centerAddressNumber()).toBe(4600);
    expect(state.rangeLabel()).toBe('A-4590 - A-4610');
  });

  it('selects only empty vicinity rows for relocation', () => {
    state.loadData();

    state.selectRow(state.rows().find((row) => row.addressNumber === 3299)!);
    expect(state.selectedTarget()).toBeNull();

    state.selectRow(state.rows().find((row) => row.addressNumber === 3300)!);
    expect(state.selectedTargetLabel()).toBe('A-3300');
    expect(state.canRelocate()).toBeFalse();

    state.setDestructiveConfirmed(true);
    expect(state.canRelocate()).toBeTrue();
  });

  it('relocates through the canonical relocation boundary and reloads vicinity', () => {
    state.loadData();
    state.selectRow(state.rows().find((row) => row.addressNumber === 3300)!);
    state.setDestructiveConfirmed(true);

    estateAddresses.getActiveHeroCurrentAddress.and.returnValue(of(currentAddress(3300)));
    state.relocate();

    expect(estateRelocation.relocateActiveHeroEstate).toHaveBeenCalledWith({
      districtCode: 'A',
      addressNumber: 3300,
      confirmDestroyExistingEstate: true,
      reason: 'Player estate relocation from vicinity page.',
    });
    expect(state.relocationSuccess()).toBe(
      'Estate relocated to A-3300. The previous estate was reset and the new district baseline was initialized.',
    );
    expect(toast.show).toHaveBeenCalledWith(
      'success',
      'Estate relocated',
      'Estate relocated to A-3300. The previous estate was reset and the new district baseline was initialized.',
    );
    expect(state.error()).toBeNull();
    expect(state.currentAddressLabel()).toBe('A-3300');
    expect(state.rangeLabel()).toBe('A-3290 - A-3310');
    expect(estateAddresses.getOccupiedAddressesForAddressNumberRange).toHaveBeenCalledTimes(2);
  });

  it('ignores stale relocation responses after the selected target changes', () => {
    const relocation = new Subject<EstateRelocationResult>();

    state.loadData();
    state.selectRow(state.rows().find((row) => row.addressNumber === 3300)!);
    state.setDestructiveConfirmed(true);
    estateRelocation.relocateActiveHeroEstate.and.returnValue(relocation.asObservable());

    state.relocate();
    state.selectedTarget.set(null);

    estateAddresses.getActiveHeroCurrentAddress.and.returnValue(of(currentAddress(3300)));
    relocation.next(relocationResult());
    relocation.complete();

    expect(state.relocationSuccess()).toBeNull();
    expect(state.relocationError()).toBeNull();
    expect(state.currentAddressLabel()).toBe('A-3301');
    expect(state.isRelocating()).toBeFalse();
  });

  it('shows local feedback when relocation is attempted without confirmation', () => {
    state.relocate();

    expect(estateRelocation.relocateActiveHeroEstate).not.toHaveBeenCalled();
    expect(state.relocationError())
      .toBe('Choose an empty vicinity address and confirm the destructive reset.');
    expect(toast.show).toHaveBeenCalledWith(
      'warn',
      'Relocation unavailable',
      'Choose an empty vicinity address and confirm the destructive reset.',
    );
  });
});

function district(
  districtCode: string,
  addressCapacity: number,
): EstateDistrictCapacityReadModel {
  return {
    districtCode,
    label: `District ${districtCode}`,
    description: `District ${districtCode} addresses.`,
    helperText: null,
    adminDescription: null,
    addressCapacity,
    sortOrder: 10,
    isActive: true,
  };
}

function currentAddress(addressNumber: number): CurrentEstateAddressReadModel {
  return {
    estateId: 'estate-1',
    serverId: 'server-1',
    districtCode: 'A',
    addressNumber,
    addressLabel: `A-${addressNumber}`,
    districtName: 'District A',
  };
}

function occupiedAddress(addressNumber: number): OccupiedEstateAddressReadModel {
  return {
    estateId: `estate-${addressNumber}`,
    serverId: 'server-1',
    districtCode: 'A',
    addressNumber,
    addressLabel: `A-${addressNumber}`,
    isOccupied: true,
  };
}

function relocationResult(): EstateRelocationResult {
  return {
    oldEstateId: 'estate-1',
    newEstateId: 'estate-2',
    heroId: 'hero-1',
    serverId: 'server-1',
    districtCode: 'A',
    addressNumber: 3300,
    addressLabel: 'A-3300',
    auditLogId: 'audit-1',
  };
}
