export type ArticlePreview = {
    id: number
    title: string
    slug: string
    excerpt: string
    category: string
    tags: string[]
    coverImage: string | null
}

export type VirtualTourPreview = {
    id: number
    name: string
    description: string
    category: string
    previewImage: string | null
    sphereCount: number
}

export type Pagination = {
    current_page: number
    last_page: number
    per_page: number
    total: number
}

export type Category = {
    id: number
    name: string
}

export interface AllArticlesProps {
    articles: ArticlePreview[]
    categories: Category[]
    activeCategory?: string | null
    pagination: Pagination
}

export interface AllToursProps {
    virtualTours: VirtualTourPreview[]
    categories: Category[]
    activeCategory?: string | null
    pagination: Pagination
}