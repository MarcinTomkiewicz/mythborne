import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { Backend } from '../backend/backend';
import { PlayerRelationshipDeclarations } from './player-relationship-declarations';

describe('PlayerRelationshipDeclarations', () => {
  let backend: jasmine.SpyObj<Backend>;
  let service: PlayerRelationshipDeclarations;

  beforeEach(() => {
    backend = jasmine.createSpyObj<Backend>('Backend', [
      'rpc',
      'getAll',
      'create',
      'createMany',
      'update',
      'upsert',
    ]);
    backend.rpc.and.returnValue(of([{ declaration_id: 'declaration-1' }]));

    TestBed.configureTestingModule({
      providers: [
        PlayerRelationshipDeclarations,
        { provide: Backend, useValue: backend },
      ],
    });
    service = TestBed.inject(PlayerRelationshipDeclarations);
  });

  it('submits relationship declaration through canonical RPC only', async () => {
    const result = await firstValueFrom(
      service.createDeclaration({
        serverId: 'server-1',
        declarationTypeKey: 'shared_household',
        title: 'Shared household',
        description: 'We share a household.',
        createdByHeroId: 'hero-1',
        participants: [{ heroId: 'hero-2', roleKey: 'related_player' }],
      }),
    );

    expect(result).toEqual({ declarationId: 'declaration-1' });
    expect(backend.rpc).toHaveBeenCalledOnceWith(
      RPC.create_player_relationship_declaration,
      jasmine.objectContaining({
        p_server_id: 'server-1',
        p_declaration_type_key: 'shared_household',
        p_title: 'Shared household',
        p_description: 'We share a household.',
        p_created_by_hero_id: 'hero-1',
      }),
    );
    expect(backend.getAll).not.toHaveBeenCalled();
    expect(backend.create).not.toHaveBeenCalled();
    expect(backend.createMany).not.toHaveBeenCalled();
    expect(backend.update).not.toHaveBeenCalled();
    expect(backend.upsert).not.toHaveBeenCalled();
  });

  it('fails clearly when declaration RPC returns no row', async () => {
    backend.rpc.and.returnValue(of([]));

    await expectAsync(
      firstValueFrom(
        service.createDeclaration({
          serverId: 'server-1',
          declarationTypeKey: 'shared_household',
          title: 'Shared household',
          description: 'We share a household.',
          createdByHeroId: 'hero-1',
        }),
      ),
    ).toBeRejectedWithError(
      'Relationship declaration submission returned no declaration.',
    );
  });
});
