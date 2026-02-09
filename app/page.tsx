import { StorefrontTemplate } from '@/components/templates/storefront-template';
import { resolveTemplateKey } from '@/lib/template-config';

export default function HomePage({ searchParams }: { searchParams?: { template?: string } }) {
  const template = resolveTemplateKey(searchParams?.template);

  return <StorefrontTemplate template={template} />;
}
