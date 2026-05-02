import { Database } from './database.types';

export type PersistCombatResultSnapshotRpcArgs =
  Database['public']['Functions']['persist_combat_result_snapshot']['Args'];

export type PersistCombatResultSnapshotRpcRow =
  Database['public']['Functions']['persist_combat_result_snapshot']['Returns'][number];
