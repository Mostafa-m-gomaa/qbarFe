import type { ProjectActorSummary } from '@/api/projects/projects.types';
import { ActorLabel } from '@/components/common/actor-label';

interface ProjectActorLabelProps {
  user: ProjectActorSummary | null | undefined;
  /** Raw user id when the summary is missing (deleted user, etc.). */
  fallbackUserId: string;
}

export function ProjectActorLabel({ user, fallbackUserId }: ProjectActorLabelProps) {
  return <ActorLabel user={user} fallbackUserId={fallbackUserId} />;
}
