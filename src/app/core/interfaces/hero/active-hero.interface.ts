import { IHero } from '../../domain/hero/hero.model';
import { SelectedGameServer } from '../server/active-server.interface';
import { Row } from '../../types/supabase.types';

export interface ActiveHeroState {
  userId: string;
  serverId: string;
  heroId: string | null;
  server: SelectedGameServer;
  hero: IHero | null;
  heroRow: Row<'hero'> | null;
}

export interface RequiredActiveHeroState extends ActiveHeroState {
  heroId: string;
  hero: IHero;
  heroRow: Row<'hero'>;
}
