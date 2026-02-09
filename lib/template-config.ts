export type TemplateKey = 'supermarket' | 'clothes' | 'medicines';

export type TemplateTheme = {
  label: string;
  accent: string;
  gradientClass: string;
  categories: string[];
  heroTitle: string;
  heroSubtitle: string;
  promo: string;
};

export const templateThemes: Record<TemplateKey, TemplateTheme> = {
  supermarket: {
    label: 'Supermarket',
    accent: '#16a34a',
    gradientClass: 'bg-gradient-supermarket',
    categories: ['Fresh Produce', 'Bakery', 'Dairy', 'Pantry Staples'],
    heroTitle: 'Weekly grocery deals delivered in minutes',
    heroSubtitle: 'From fruits to frozen foods, browse curated essentials and lightning-fast restocks.',
    promo: 'Save 15% on first basket over $50 with code FRESH15'
  },
  clothes: {
    label: 'Clothes',
    accent: '#7c3aed',
    gradientClass: 'bg-gradient-clothes',
    categories: ['Streetwear', 'Basics', 'Outerwear', 'Accessories'],
    heroTitle: 'Style drops for every season',
    heroSubtitle: 'Premium fits, capsule picks, and daily launches from trending collections.',
    promo: 'Free shipping on 2+ items and bonus loyalty points this week'
  },
  medicines: {
    label: 'Medicines',
    accent: '#0284c7',
    gradientClass: 'bg-gradient-medicines',
    categories: ['Daily Care', 'Supplements', 'Personal Care', 'First Aid'],
    heroTitle: 'Trusted health essentials at your doorstep',
    heroSubtitle: 'Shop verified care products, refill reminders, and wellness bundles with confidence.',
    promo: '24/7 pharmacist support + 10% off subscriptions'
  }
};

export function resolveTemplateKey(value?: string | null): TemplateKey {
  if (value === 'supermarket' || value === 'clothes' || value === 'medicines') return value;

  const envTemplate = process.env.NEXT_PUBLIC_TEMPLATE;
  if (envTemplate === 'supermarket' || envTemplate === 'clothes' || envTemplate === 'medicines') return envTemplate;

  return 'supermarket';
}
