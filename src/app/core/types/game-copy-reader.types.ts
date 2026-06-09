import { Observable } from 'rxjs';
import { Backend } from '../services/backend/backend';
import {
  GameCopyRegistry,
  GameCopyRegistryArgs,
  GameCopyRegistryKind,
} from './game-copy-registry.types';

export type GameCopyReader<Kind extends GameCopyRegistryKind> = (
  backend: Backend,
  args: GameCopyRegistryArgs[Kind],
) => Observable<GameCopyRegistry[Kind]>;

export type GameCopyReaders = {
  [Kind in GameCopyRegistryKind]: GameCopyReader<Kind>;
};
