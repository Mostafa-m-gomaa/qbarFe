import { useMemo, useState } from 'react';

import { PageHeader } from '@/components/common/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PERMISSIONS } from '@/constants/permissions';
import { strings } from '@/constants/strings';
import { CommercialFollowUpsSection } from '@/features/follow-ups/commercial-follow-ups-section';
import { useAnyPermission } from '@/hooks/use-permission';

import { ProjectActivitiesSection } from './project-activities-section';

type WorkspaceTab = 'commercial' | 'projects';

export function ActivitiesPage() {
  const canActivities = useAnyPermission([
    PERMISSIONS.activities.read,
    PERMISSIONS.activities.readAll,
  ]);
  const canFollowUps = useAnyPermission([
    PERMISSIONS.followUps.read,
    PERMISSIONS.followUps.readAll,
  ]);

  const defaultTab = useMemo<WorkspaceTab>(
    () => (canFollowUps ? 'commercial' : 'projects'),
    [canFollowUps],
  );
  const [tab, setTab] = useState<WorkspaceTab>(defaultTab);

  return (
    <div className="space-y-6">
      <PageHeader title={strings.activities.title} description={strings.activities.subtitle} />

      {canActivities && canFollowUps ? (
        <Tabs value={tab} onValueChange={(v) => setTab(v as WorkspaceTab)}>
          <TabsList>
            <TabsTrigger value="commercial">{strings.activities.tabCommercialFollowUps}</TabsTrigger>
            <TabsTrigger value="projects">{strings.activities.tabProjectActivities}</TabsTrigger>
          </TabsList>
          <TabsContent value="commercial" className="mt-4">
            <CommercialFollowUpsSection />
          </TabsContent>
          <TabsContent value="projects" className="mt-4">
            <ProjectActivitiesSection />
          </TabsContent>
        </Tabs>
      ) : canFollowUps ? (
        <CommercialFollowUpsSection />
      ) : (
        <ProjectActivitiesSection />
      )}
    </div>
  );
}
