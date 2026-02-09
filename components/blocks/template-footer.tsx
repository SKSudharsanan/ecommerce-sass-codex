import type { TemplateKey } from '@/lib/template-config';
import { templateThemes } from '@/lib/template-config';

export function TemplateFooter({ template }: { template: TemplateKey }) {
  return <footer className="template-footer">Built with {templateThemes[template].label} design system variant.</footer>;
}
