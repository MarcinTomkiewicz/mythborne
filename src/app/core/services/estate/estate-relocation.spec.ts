import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { RelocateHeroEstateRpcRow } from '../../types/estate-relocation-rpc.types';
import { Backend } from '../backend/backend';
import { ActiveHero } from '../hero/active-hero';
import { EstateRelocation } from './estate-relocation';
import { EstateAddresses } from './estate-addresses';

describe('EstateRelocation', () => {
  let service: EstateRelocation;
  let activeHero: jasmine.SpyObj<ActiveHero>;
  let backend: jasmine.SpyObj<Backend>;
  let estateAddresses: jasmine.SpyObj<EstateAddresses>;

  beforeEach(() => {
    activeHero = jasmine.createSpyObj<ActiveHero>('ActiveHero', [
      'requireActiveHero',
      'loadActiveHero',
    ]);
    backend = jasmine.createSpyObj<Backend>('Backend', [
      'rpc',
      'create',
      'createMany',
      'update',
      'updateWhere',
      'delete',
    ]);
    estateAddresses = jasmine.createSpyObj<EstateAddresses>('EstateAddresses', [
      'getCurrentAddress',
    ]);

    activeHero.requireActiveHero.and.returnValue(
      of({
        heroRow: { id: 'hero-1' } as never,
        heroId: 'hero-1',
        hero: {} as never,
        userId: 'user-1',
        serverId: 'server-1',
        server: {} as never,
      }),
    );
    activeHero.loadActiveHero.and.returnValue(of({
      heroRow: { id: 'hero-1', estate_id: 'estate-new' },
      heroId: 'hero-1',
      hero: {} as never,
      userId: 'user-1',
      serverId: 'server-1',
      server: {} as never,
    } as never));
    backend.rpc.and.returnValue(of([relocationRow()]));
    estateAddresses.getCurrentAddress.and.returnValue(of({
      estateId: 'estate-new',
      serverId: 'server-1',
      districtCode: 'C',
      addressNumber: 12,
      addressLabel: 'C-12',
      districtName: 'District C',
    }));

    TestBed.configureTestingModule({
      providers: [
        EstateRelocation,
        { provide: ActiveHero, useValue: activeHero },
        { provide: Backend, useValue: backend },
        { provide: EstateAddresses, useValue: estateAddresses },
      ],
    });
    service = TestBed.inject(EstateRelocation);
  });

  it('relocates active hero estate through canonical owner-safe RPC', async () => {
    const result = await firstValueFrom(
      service.relocateActiveHeroEstate({
        districtCode: 'C',
        addressNumber: 12,
        confirmDestroyExistingEstate: true,
        reason: 'Player request.',
      }),
    );

    expect(backend.rpc).toHaveBeenCalledWith(
      RPC.relocate_hero_estate_to_empty_address,
      {
        p_hero_id: 'hero-1',
        p_district_code: 'C',
        p_address_number: 12,
        p_confirm_destroy_existing_estate: true,
        p_reason: 'Player request.',
      },
    );
    expect(activeHero.loadActiveHero).toHaveBeenCalled();
    expect(estateAddresses.getCurrentAddress).toHaveBeenCalledWith({
      estateId: 'estate-new',
      heroId: 'hero-1',
      serverId: 'server-1',
    });
    expect(result.addressLabel).toBe('C-12');
    expect(backend.create).not.toHaveBeenCalled();
    expect(backend.createMany).not.toHaveBeenCalled();
    expect(backend.update).not.toHaveBeenCalled();
    expect(backend.updateWhere).not.toHaveBeenCalled();
    expect(backend.delete).not.toHaveBeenCalled();
  });

  it('fails if refreshed active hero does not point to the new estate', async () => {
    activeHero.loadActiveHero.and.returnValue(of({
      heroRow: { id: 'hero-1', estate_id: null },
      heroId: 'hero-1',
      hero: {} as never,
      userId: 'user-1',
      serverId: 'server-1',
      server: {} as never,
    } as never));

    await expectAsync(firstValueFrom(
      service.relocateActiveHeroEstate({
        districtCode: 'C',
        addressNumber: 12,
        confirmDestroyExistingEstate: true,
      }),
    )).toBeRejectedWithError(
      'Estate relocation invariant failed: active hero was not assigned to the new estate.',
    );

    expect(estateAddresses.getCurrentAddress).not.toHaveBeenCalled();
  });

  it('fails if the new estate address cannot be read after refresh', async () => {
    estateAddresses.getCurrentAddress.and.returnValue(of(null));

    await expectAsync(firstValueFrom(
      service.relocateActiveHeroEstate({
        districtCode: 'C',
        addressNumber: 12,
        confirmDestroyExistingEstate: true,
      }),
    )).toBeRejectedWithError(
      'Estate relocation invariant failed: new estate address is not readable for the active hero.',
    );
  });
});

function relocationRow(): RelocateHeroEstateRpcRow {
  return {
    old_estate_id: 'estate-old',
    new_estate_id: 'estate-new',
    hero_id: 'hero-1',
    server_id: 'server-1',
    district_code: 'C',
    address_number: 12,
    address: 'legacy-display',
    audit_log_id: 'audit-1',
  };
}
