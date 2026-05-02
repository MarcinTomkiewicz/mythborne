import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { CombatAttackEvent } from '../../domain/combat/combat.model';
import { CombatantSnapshot } from '../../domain/combat/combat-sandbox.model';
import {
  toCombatSandboxLogEntries,
  toCombatSandboxResultFromStep,
} from '../../utils/combat-sandbox-result-mappers';
import { CombatSandboxStepResolverService } from './combat-sandbox-step-resolver';

@Injectable({ providedIn: 'root' })
export class CombatSandboxCallerService {
  private readonly stepResolver = inject(CombatSandboxStepResolverService);

  resolvePlayerStep(input: {
    heroId: string;
    hero: CombatantSnapshot;
    enemy: CombatantSnapshot;
    heroHealth: number;
    enemyHealth: number;
    turnNumber: number;
    attackOrderStart: number;
    indicatorPosition: number;
    streak: number;
  }): Observable<{
    result: ReturnType<typeof toCombatSandboxResultFromStep>;
    logEntries: ReturnType<typeof toCombatSandboxLogEntries>;
    attacks: readonly CombatAttackEvent[];
    heroHealth: number;
    enemyHealth: number;
    turnsPlayed: number;
    turnLimit: number;
  }> {
    return this.stepResolver.resolveStep(input).pipe(
      map((step) => {
        const logEntries = toCombatSandboxLogEntries(
          step.events,
          input.hero,
          input.enemy,
          input.indicatorPosition,
        );

        return {
          result: toCombatSandboxResultFromStep(step, logEntries),
          logEntries,
          attacks: step.events,
          heroHealth: step.heroHealth,
          enemyHealth: step.enemyHealth,
          turnsPlayed: step.turnsPlayed,
          turnLimit: step.turnLimit,
        };
      }),
    );
  }

}
