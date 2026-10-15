import { LogOut } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { PageHeader } from '@/components/common/page-header';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { strings } from '@/constants/strings';
import { useAuthStore } from '@/stores/auth/auth.store';

import { ChangePasswordForm } from './change-password-form';

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('') || '?';
}

export function SettingsPage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="space-y-6">
      <PageHeader title={strings.settings.title} description={strings.settings.subtitle} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{strings.settings.profile}</CardTitle>
            <CardDescription>{strings.settings.profileSubtitle}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user && (
              <div className="flex items-center gap-4">
                <Avatar className="size-12">
                  <AvatarFallback className="text-base">{initials(user.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground" dir="ltr">
                    {user.email}
                  </p>
                </div>
              </div>
            )}
            <div>
              <Button variant="outline" onClick={handleLogout} disabled={loggingOut}>
                <LogOut />
                {strings.auth.signOut}
              </Button>
            </div>
          </CardContent>
        </Card>

        <ChangePasswordForm />
      </div>
    </div>
  );
}
