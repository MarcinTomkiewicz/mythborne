import { ServerStaffRole } from '../enums/active-server.enum';
import { AdminSelectOption } from '../types/admin-ui.types';

export const STAFF_CANDIDATE_DEFAULT_LIMIT = 25;
export const STAFF_CANDIDATE_MIN_QUERY_LENGTH = 2;

export const SERVER_STAFF_ROLE_OPTIONS: readonly AdminSelectOption[] = [
  { label: 'Owner', value: ServerStaffRole.Owner },
  { label: 'Operator', value: ServerStaffRole.Operator },
  { label: 'Moderator', value: ServerStaffRole.Moderator },
  { label: 'Tester', value: ServerStaffRole.Tester },
];
