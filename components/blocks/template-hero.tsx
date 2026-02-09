import type { TemplateKey } from '@/lib/template-config';
import { templateThemes } from '@/lib/template-config';

export function TemplateHero({ template }: { template: TemplateKey }) {
  const theme = templateThemes[template];

  return (
    <section className={`hero-block ${theme.gradientClass}`}>
      <p className="hero-label">{theme.label} template</p>
      <h1>{theme.heroTitle}</h1>
      <p>{theme.heroSubtitle}</p>
    </section>
  );
}
