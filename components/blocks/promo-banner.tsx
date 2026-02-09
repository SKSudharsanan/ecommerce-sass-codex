import type { TemplateKey } from '@/lib/template-config';
import { templateThemes } from '@/lib/template-config';

export function PromoBanner({ template }: { template: TemplateKey }) {
  return (
    <section className="promo-banner glass-card bg-gradient-promo">
      <strong>Promo</strong>
      <p>{templateThemes[template].promo}</p>
    </section>
  );
}
