import { Badge } from '@/components/ui/badge';
import { strings } from '@/constants/strings';

/** Active/inactive badge with semantic coloring. */
export function ActiveBadge({ active }: { active: boolean }) {
  return (
    <Badge variant={active ? 'success' : 'secondary'}>
      {active ? strings.common.active : strings.common.inactive}
    </Badge>
  );
}
