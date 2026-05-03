import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import { IHero } from '../../domain/hero/hero.model';
import { Insert, Row } from '../../types/supabase.types';
import { FilterOperator } from '../../enums/filter-operators';
import { EstateAddressRow } from '../../types/hero-service.types';
import { AuthState } from '../auth/auth-state';
import { Backend } from '../backend/backend';
import { HeroFactory } from '../hero-factory/hero-factory';
import { ActiveServer } from '../server/active-server';

@Injectable({ providedIn: 'root' })
export class CreateHero {
  private readonly authState = inject(AuthState);
  private readonly heroFactory = inject(HeroFactory);
  private readonly backend = inject(Backend);
  private readonly activeServer = inject(ActiveServer);

  createHero(
    heroId: string,
    characterName: string,
    originId: string
  ): Observable<IHero> {
    const userId = this.authState.user()?.id;

    if (!userId) {
      throw new Error('Cannot create a hero without an authenticated user.');
    }

    return this.resolveCurrentServerId().pipe(
      switchMap((serverId) => {
        const heroPayload: Insert<'hero'> = {
          id: heroId,
          user_id: userId,
          server_id: serverId,
          name: characterName,
          level: 1,
          experience: 0,
          character_points: 0,
          total_character_points_earned: 0,
          origin_id: originId,
          rank: 1,
          created_at: new Date().toISOString(),
          profile_picture: null,
        };
        const stats = this.heroFactory.createStats(heroId);
        const resources = this.heroFactory.createResources(heroId);

        return this.backend.create<Insert<'hero'>>(TABLES.hero, heroPayload).pipe(
          switchMap(() =>
            forkJoin([
              this.backend.createMany(TABLES.hero_stats, stats),
              this.backend.createMany(TABLES.hero_resources, resources),
            ])
          ),
          map(() => {
            const hero: IHero = {
              id: heroPayload.id ?? heroId,
              userId,
              serverId,
              name: heroPayload.name,
              level: heroPayload.level ?? 1,
              rank: heroPayload.rank ?? 1,
              experience: heroPayload.experience ?? 0,
              totalExperienceEarned: heroPayload.total_experience_earned ?? 0,
              characterPoints: heroPayload.character_points ?? 0,
              totalCharacterPointsEarned: heroPayload.total_character_points_earned ?? 0,
              originId: heroPayload.origin_id ?? null,
              estateId: heroPayload.estate_id ?? null,
              profilePicture: heroPayload.profile_picture ?? null,
              createdAt: heroPayload.created_at ?? null,
            };

            this.authState.setHero(hero);
            return hero;
          })
        );
      })
    );
  }

  assignFreeEstate(heroId: string): Observable<void> {
    const districtCode = 'A';
    const rank = 1;
    const maxAddresses = 5000;

    return this.backend.getAll<Pick<Row<'hero'>, 'server_id'>>({
      table: TABLES.hero,
      filters: {
        id: { operator: FilterOperator.EQ, value: heroId },
      },
      select: 'server_id',
      range: { from: 0, to: 0 },
      camelCase: false,
    }).pipe(
      switchMap((heroRows) => {
        const serverId = heroRows[0]?.server_id;

        if (!serverId) {
          throw new Error('Cannot assign estate without a hero server.');
        }

        return this.backend.getAll<EstateAddressRow>({
      table: TABLES.estates,
      filters: {
        districtCode: { operator: FilterOperator.EQ, value: districtCode },
        rank: { operator: FilterOperator.EQ, value: rank },
        serverId: { operator: FilterOperator.EQ, value: serverId },
      },
      select: 'id, address, hero_id',
      camelCase: false,
    }).pipe(
      switchMap((estates) => {
        const existingMap = new Map<number, { id: string; hero_id: string | null }>();

        for (const estate of estates) {
          const match = estate.address?.match(/^A-(\d+)$/);

          if (match) {
            const number = parseInt(match[1], 10);
            existingMap.set(number, { id: estate.id, hero_id: estate.hero_id });
          }
        }

        const allNumbers = Array.from({ length: maxAddresses }, (_, index) => index + 1);
        const availableNumbers = allNumbers.filter((number) => {
          const entry = existingMap.get(number);
          return !entry || entry.hero_id === null;
        });

        if (availableNumbers.length === 0) {
          throw new Error(`No free addresses available in district ${districtCode}`);
        }

        const random = availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
        const address = `${districtCode}-${random}`;
        const existing = existingMap.get(random);

        if (existing && existing.hero_id === null) {
          return this.backend
            .updateWhere(
              TABLES.estates,
              { id: { operator: FilterOperator.EQ, value: existing.id } },
              { heroId }
            )
            .pipe(
              switchMap((rows) => {
                if (rows.length === 0) {
                  throw new Error('Estate assignment did not affect any row.');
                }

                return this.linkEstateToHero(heroId, existing.id);
              })
            );
        }

        const estateId = crypto.randomUUID();

        return this.backend
          .create(TABLES.estates, {
            id: estateId,
            address,
            rank,
            heroId,
            serverId,
            districtCode,
          })
          .pipe(
            switchMap(() =>
              this.backend.getAll<{ id: string }>({
                table: TABLES.buildings,
                filters: { rankRequired: { operator: FilterOperator.EQ, value: rank } },
                select: 'id',
              }).pipe(
                switchMap((buildings) => {
                  const insertPayload = buildings.map((building) => ({
                    estateId,
                    buildingId: building.id,
                    level: 1,
                  }));

                  if (insertPayload.length === 0) {
                    return this.linkEstateToHero(heroId, estateId);
                  }

                  return this.backend
                    .createMany(TABLES.estate_buildings, insertPayload)
                    .pipe(switchMap(() => this.linkEstateToHero(heroId, estateId)));
                })
              )
            )
          );
      }));
      })
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
      })
    );
  }

  private linkEstateToHero(heroId: string, estateId: string): Observable<void> {
    return this.backend
      .updateWhere(TABLES.hero, { id: { operator: FilterOperator.EQ, value: heroId } }, { estateId })
      .pipe(
        map((rows) => {
          if (rows.length === 0) {
            throw new Error('Hero estate update did not affect any row.');
          }

          const hero = this.authState.hero();

          if (hero?.id === heroId) {
            this.authState.setHero({
              ...hero,
              estateId,
            });
          }
        })
      );
  }
}
