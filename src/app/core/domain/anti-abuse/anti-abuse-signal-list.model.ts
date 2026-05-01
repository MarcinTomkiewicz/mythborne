import {
  AntiAbuseSignalReadModel,
  AntiAbuseSignalSeverity,
} from './anti-abuse-case.model';
import { AntiAbuseDictionaryData } from './anti-abuse-dictionary.model';

export interface AntiAbuseSignalListFilters {
  serverId: string;
  signalTypeKey?: string | null;
  severity?: AntiAbuseSignalSeverity | null;
  actorHeroId?: string | null;
  actorUserId?: string | null;
  targetHeroId?: string | null;
  targetUserId?: string | null;
  entityTypeKey?: string | null;
  entityId?: string | null;
  groupingKey?: string | null;
  isDismissed?: boolean | null;
  createdFrom?: string | null;
  createdTo?: string | null;
}

export interface AntiAbuseSignalListReadModel {
  signals: AntiAbuseSignalReadModel[];
  dictionaries: Pick<AntiAbuseDictionaryData, 'signalTypes'>;
}
