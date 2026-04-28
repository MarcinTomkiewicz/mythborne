import { Database } from './database.types';
import { Row } from './supabase.types';

export type StaffUserAccountRow = Pick<
  Row<'user_data'>,
  'id' | 'email' | 'name' | 'role_id' | 'photo_url'
>;

export type SearchServerStaffCandidateRow =
  Database['public']['Functions']['search_server_staff_candidates']['Returns'][number];
