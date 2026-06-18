import { GameServerKind, GameServerStatus } from '../enums/active-server.enum';
import {
  SelectedGameServer,
  ServerAccessState,
} from '../interfaces/server/active-server.interface';

export function canShowSandboxTestTools(
  server: SelectedGameServer | null,
  access: ServerAccessState,
): boolean {
  return access.canAccessSandbox &&
    (
      server?.kind === GameServerKind.Sandbox ||
      server?.status === GameServerStatus.Testing ||
      Boolean(server?.canUseAsSandbox)
    );
}
