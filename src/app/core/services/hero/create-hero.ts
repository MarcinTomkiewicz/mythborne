import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, switchMap } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import { IHero } from '../../domain/hero/hero.model';
import { Insert } from '../../types/supabase.types';
import { FilterOperator } from '../../enums/filter-operators';
import { EstateAddressRow } from '../../types/hero-service.types';
import { AuthState } from '../auth/auth-state';
import { Backend } from '../backend/backend';
import { HeroFactory } from '../hero-factory/hero-factory';

@Injectable({ providedIn: 'root' })
export class CreateHero {
  private readonly authState = inject(AuthState);
  private readonly heroFactory = inject(HeroFactory);
  private readonly backend = inject(Backend);

  createHero(
    heroId: string,
    characterName: string,
    originId: string
  ): Observable<IHero> {
    const heroPayload: Insert<'hero'> = {
      id: heroId,
      name: characterName,
      level: 1,
      experience: 0,
      origin_id: originId,
      rank: 1,
      created_at: new Date().toISOString(),
      profile_picture: null,
    };

    const stats = this.heroFactory.createStats(heroId);
    const derived = this.heroFactory.createDerived(heroId);
    const resources = this.heroFactory.createResources(heroId);

    return this.backend.create<Insert<'hero'>>(TABLES.hero, heroPayload).pipe(
      switchMap(() =>
        forkJoin([
          this.backend.createMany(TABLES.hero_stats, stats),
          this.backend.create(TABLES.hero_derived, derived),
          this.backend.createMany(TABLES.hero_resources, resources),
        ])
      ),
      map(() => {
        const hero: IHero = {
          id: heroPayload.id,
          name: heroPayload.name,
          level: heroPayload.level ?? 1,
          rank: heroPayload.rank ?? 1,
          experience: heroPayload.experience ?? 0,
          originId: heroPayload.origin_id ?? null,
          estateId: heroPayload.estate_id ?? null,
          profilePicture: heroPayload.profile_picture ?? null,
          createdAt: heroPayload.created_at ?? null,
        };

        this.authState.setHero(hero);
        return hero;
      })
    );
  }

  assignFreeEstate(heroId: string): Observable<void> {
    const districtCode = 'A';
    const rank = 1;
    const maxAddresses = 5000;

    return this.backend.getAll<EstateAddressRow>({
      table: TABLES.estates,
      filters: {
        districtCode: { operator: FilterOperator.EQ, value: districtCode },
        rank: { operator: FilterOperator.EQ, value: rank },
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
