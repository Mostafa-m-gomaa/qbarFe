import type { ActorSummary } from '@/api/common/actor.types';
import { strings } from '@/constants/strings';

interface ActorLabelProps {
  user?: ActorSummary | null | undefined;
  /** Raw user id when the summary is missing (deleted user, etc.). */
  fallbackUserId?: string;
}

export function ActorLabel({ user, fallbackUserId }: ActorLabelProps) {
  if (user) {
    return (
      <span>
        {user.name}
        <span className="block text-xs text-muted-foreground">{user.email}</span>
      </span>
    );
  }
  if (fallbackUserId) {
    return <span className="text-muted-foreground">{fallbackUserId}</span>;
  }
  return <span>{strings.common.none}</span>;
}
