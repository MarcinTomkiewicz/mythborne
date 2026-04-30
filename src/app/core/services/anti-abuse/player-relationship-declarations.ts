import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import {
  CreatePlayerRelationshipDeclarationInput,
  CreatedPlayerRelationshipDeclaration,
} from '../../domain/anti-abuse/player-relationship-declaration-submit.model';
import { CreatePlayerRelationshipDeclarationRpcRow } from '../../types/anti-abuse-decision-rpc.types';
import {
  mapCreatedPlayerRelationshipDeclaration,
  toCreatePlayerRelationshipDeclarationRpcArgs,
} from '../../utils/player-relationship-declaration-rpc';
import { Backend } from '../backend/backend';

@Injectable({ providedIn: 'root' })
export class PlayerRelationshipDeclarations {
  private readonly backend = inject(Backend);

  createDeclaration(
    input: CreatePlayerRelationshipDeclarationInput,
  ): Observable<CreatedPlayerRelationshipDeclaration> {
    return this.backend
      .rpc<CreatePlayerRelationshipDeclarationRpcRow[]>(
        RPC.create_player_relationship_declaration,
        toCreatePlayerRelationshipDeclarationRpcArgs(input),
      )
      .pipe(
        map((rows) => {
          const row = rows[0];

          if (!row) {
            throw new Error('Relationship declaration submission returned no declaration.');
          }

          return mapCreatedPlayerRelationshipDeclaration(row);
        }),
      );
  }
}
