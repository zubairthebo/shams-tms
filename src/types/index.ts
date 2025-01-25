export type Language = 'ar' | 'en';

export type NewsItem = {
  id: string;
  text: string;
  category: string;
  timestamp: Date;
};

export const categories = {
  politics: { ar: 'سياسة', en: 'Politics' },
  sports: { ar: 'رياضة', en: 'Sports' },
  economy: { ar: 'اقتصاد', en: 'Economy' },
  technology: { ar: 'تكنولوجيا', en: 'Technology' },
} as const;