import type { TemplateKey } from '@/lib/template-config';
import { templateThemes } from '@/lib/template-config';

export function CategoryGrid({ template }: { template: TemplateKey }) {
  const theme = templateThemes[template];

  return (
    <section>
      <h2>Categories</h2>
      <div className="category-grid">
        {theme.categories.map((category) => (
          <article className="glass-card category-card" key={category}>
            <h3>{category}</h3>
            <p>Curated products and top picks updated daily.</p>
          </article>
        ))}
      </div>
    </section>
  );
}
