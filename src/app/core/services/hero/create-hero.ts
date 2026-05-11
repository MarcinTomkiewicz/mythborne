import { inject, Injectable } from '@angular/core';
import { map, Observable, of, switchMap } from 'rxjs';
import { StartFlowHeroCreationResult } from '../../domain/start-flow/start-flow.model';
import { trimText } from '../../utils/normalize-text';
import { AuthState } from '../auth/auth-state';
import { ActiveServer } from '../server/active-server';
import { StartFlow } from '../start-flow/start-flow';
import { ActiveHero } from './active-hero';

@Injectable({ providedIn: 'root' })
export class CreateHero {
  private readonly authState = inject(AuthState);
  private readonly activeHero = inject(ActiveHero);
  private readonly activeServer = inject(ActiveServer);
  private readonly startFlow = inject(StartFlow);

  createHero(
    characterName: string,
    originId: string,
  ): Observable<StartFlowHeroCreationResult> {
    if (!this.authState.user()?.id) {
      throw new Error('Cannot create a hero without an authenticated user.');
    }

    return this.resolveCurrentServerId().pipe(
      switchMap((serverId) =>
        this.startFlow.createHero({
          serverId,
          originId,
          heroName: trimText(characterName),
          requestId: `start-flow:${serverId}:${crypto.randomUUID()}`,
        }),
      ),
      switchMap((result) =>
        this.activeHero.loadActiveHero().pipe(map(() => result)),
      ),
    );
  }

  private resolveCurrentServerId(): Observable<string> {
    const selectedServerId = this.activeServer.selectedServer()?.id ?? null;

    if (selectedServerId) {
      return of(selectedServerId);
    }

    return this.activeServer.loadAccessibleServers().pipe(
      map(() => {
        const serverId = this.activeServer.selectedServer()?.id ?? null;

        if (!serverId) {
          throw new Error('No accessible game server is configured for hero creation.');
        }

        return serverId;
      }),
    );
  }
}
