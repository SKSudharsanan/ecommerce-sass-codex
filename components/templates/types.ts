import type { TemplateKey } from '@/lib/template-config';

export type ProductTeaser = {
  name: string;
  price: string;
  meta: string;
};

export type TemplateProps = {
  template: TemplateKey;
};
