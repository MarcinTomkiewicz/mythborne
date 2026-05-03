import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import {
  CurrentEstateAddressReadModel,
  EstateDistrictCapacityReadModel,
  OccupiedEstateAddressReadModel,
} from '../../../core/domain/estate/estate-address.model';
import { EstateRelocationResult } from '../../../core/domain/estate/estate-relocation.model';
import { EstateAddresses } from '../../../core/services/estate/estate-addresses';
import { EstateRelocation } from '../../../core/services/estate/estate-relocation';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { EstateVicinityPageState } from './estate-vicinity-page.state';

describe('EstateVicinityPageState', () => {
  let state: EstateVicinityPageState;
  let activeHero: jasmine.SpyObj<ActiveHero>;
  let estateAddresses: jasmine.SpyObj<EstateAddresses>;
  let estateRelocation: jasmine.SpyObj<EstateRelocation>;

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

    activeHero.requireActiveHero.and.returnValue(of({
      heroRow: { id: 'hero-1' } as never,
      heroId: 'hero-1',
      hero: {} as never,
      userId: 'user-1',
      serverId: 'server-1',
      server: {} as never,
    }));
    estateAddresses.getActiveHeroCurrentAddress.and.returnValue(of(currentAddress(3301)));
    estateAddresses.getDistrictCapacities.and.returnValue(of([district()]));
    estateAddresses.getOccupiedAddressesForAddressNumberRange.and.returnValue(of([
      occupiedAddress(3299),
      occupiedAddress(3304),
    ]));
    estateRelocation.relocateActiveHeroEstate.and.returnValue(of(relocationResult()));

    TestBed.configureTestingModule({
      providers: [
        EstateVicinityPageState,
        { provide: ActiveHero, useValue: activeHero },
        { provide: EstateAddresses, useValue: estateAddresses },
        { provide: EstateRelocation, useValue: estateRelocation },
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
    expect(state.rows().find((row) => row.addressNumber === 3301)?.kind).toBe('self');
    expect(state.rows().find((row) => row.addressNumber === 3299)?.kind).toBe('occupied');
    expect(state.rows().find((row) => row.addressNumber === 3299)?.isSelectable).toBeFalse();
    expect(state.rows().find((row) => row.addressNumber === 3300)?.kind).toBe('empty');
    expect(state.rows().find((row) => row.addressNumber === 3300)?.isSelectable).toBeTrue();
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
    expect(state.relocationSuccess()).toBe('Estate relocated to A-3300.');
    expect(state.error()).toBeNull();
    expect(state.currentAddressLabel()).toBe('A-3300');
    expect(state.rangeLabel()).toBe('A-3290 - A-3310');
    expect(estateAddresses.getOccupiedAddressesForAddressNumberRange).toHaveBeenCalledTimes(2);
  });
});

function district(): EstateDistrictCapacityReadModel {
  return {
    districtCode: 'A',
    label: 'District A',
    description: 'District A addresses.',
    helperText: null,
    adminDescription: null,
    addressCapacity: 5000,
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
