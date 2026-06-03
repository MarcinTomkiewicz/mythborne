import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { StartFlowHeroCreationResult } from '../../domain/start-flow/start-flow.model';
import { trimText } from '../../utils/normalize-text';
import { AuthState } from '../auth/auth-state';
import { StartFlow } from '../start-flow/start-flow';
import { ActiveHero } from './active-hero';

@Injectable({ providedIn: 'root' })
export class CreateHero {
  private readonly authState = inject(AuthState);
  private readonly activeHero = inject(ActiveHero);
  private readonly startFlow = inject(StartFlow);

  createHero(
    characterName: string,
    originId: string,
    serverId: string,
  ): Observable<StartFlowHeroCreationResult> {
    if (!this.authState.user()?.id) {
      throw new Error('Cannot create a hero without an authenticated user.');
    }

    if (!serverId) {
      throw new Error('Nie ma teraz świata dostępnego do stworzenia bohatera.');
    }

    return this.startFlow
      .createHero({
        serverId,
        originId,
        heroName: trimText(characterName),
        requestId: `start-flow:${serverId}:${crypto.randomUUID()}`,
      })
      .pipe(
        tap((result) => this.activeHero.applyStartFlowHeroCreationResult(result)),
      );
  }
}
