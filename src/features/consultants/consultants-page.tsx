import { consultantsConfig } from '@/features/directory/directory-config';
import { DirectoryPage } from '@/features/directory/directory-page';

export function ConsultantsPage() {
  return <DirectoryPage config={consultantsConfig} />;
}
