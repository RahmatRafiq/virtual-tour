export interface Category {
    id: number;
    name: string;
}

export interface Article {
    id: number;
    category_id: number;
    title: string;
    slug: string;
    content: string;
    tags: string[] | string;
    trashed: boolean;
    media?: { collection_name: string; original_url: string }[];
}

export interface ArticleFormProps {
    article?: Article;
    categories: Category[];
    cover?: {
        original_url: string;
        file_name: string;
        size: number;
    };
}