import { contractorsConfig } from '@/features/directory/directory-config';
import { DirectoryPage } from '@/features/directory/directory-page';

export function ContractorsPage() {
  return <DirectoryPage config={contractorsConfig} />;
}
