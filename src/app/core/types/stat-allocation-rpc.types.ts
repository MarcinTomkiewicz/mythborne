import { Database } from './database.types';

export type SaveStatAllocationRpcArgs =
  Database['public']['Functions']['save_stat_allocation']['Args'];

export type SaveStatAllocationRpcRow =
  Database['public']['Functions']['save_stat_allocation']['Returns'][number];
