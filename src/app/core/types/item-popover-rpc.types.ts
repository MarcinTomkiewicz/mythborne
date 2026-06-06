import { Database } from './database.types';

type GeneratedItemPopoverDetailRpcArgs =
  Database['public']['Functions']['item_popover_detail']['Args'];

export type ItemPopoverCopyRpcResult =
  Database['public']['Functions']['item_popover_copy']['Returns'];

export type ItemPopoverDetailRpcArgs = {
  [Key in keyof GeneratedItemPopoverDetailRpcArgs]:
    GeneratedItemPopoverDetailRpcArgs[Key] | null;
};

export type ItemPopoverDetailRpcResult =
  Database['public']['Functions']['item_popover_detail']['Returns'];
