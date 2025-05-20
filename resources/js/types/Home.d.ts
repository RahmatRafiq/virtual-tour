export interface Hero {
    title: string;
    subtitle: string;
    cta: { label: string; link: string };
  }

  export interface ArticlePreview {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    category: string;
    tags: string[];
    coverImage: string | null;
  }

  export interface VirtualTourPreview {
    id: number;
    name: string;
    description: string;
    category: string;
    previewImage: string | null;
    sphereCount: number;
  }

  export interface HomeProps {
    hero: Hero;
    articles: ArticlePreview[];
    virtualTours: VirtualTourPreview[];
  }