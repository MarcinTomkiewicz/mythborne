import {
  AntiAbuseCaseReadModel,
  AntiAbuseCaseSource,
} from './anti-abuse-case.model';
import {
  AntiAbuseCaseStatus,
  AntiAbuseCaseVerdict,
} from './anti-abuse-decision.model';

export interface AntiAbuseCaseListFilters {
  serverId: string;
  status?: AntiAbuseCaseStatus | null;
  verdict?: AntiAbuseCaseVerdict | null;
  source?: AntiAbuseCaseSource | null;
  participantHeroId?: string | null;
  participantUserId?: string | null;
  createdFrom?: string | null;
  createdTo?: string | null;
}

export type AntiAbuseCaseListItem = AntiAbuseCaseReadModel;
