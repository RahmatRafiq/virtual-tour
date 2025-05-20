import React from 'react'
import { Head, Link } from '@inertiajs/react'
import { Header } from '../Header'

interface ArticleShowProps {
    article: {
        id: number
        title: string
        content: string
        category: string
        tags: string[]
        media?: string
    }
}

export default function Show({ article }: ArticleShowProps) {
    let tags: string[] = []
    if (Array.isArray(article.tags)) {
        tags = article.tags
    } else if (typeof article.tags === 'string') {
        try {
            tags = JSON.parse(article.tags)
        } catch {
            tags = []
        }
    }

    // Fallback gambar jika media kosong/null
    const imageUrl = article.media && article.media !== ''
        ? article.media
        : '/images/placeholder-article.png'

    return (
        <>
         <Header />
            <Head title={article.title} />
            <div className="max-w-3xl mx-auto py-12 px-4">
                <h1 className="text-3xl font-bold mb-2">{article.title}</h1>
                <div className="mb-4 text-gray-500">{article.category}</div>
                <img src={imageUrl} alt={article.title} className="mb-6 rounded" />
                <div className="prose mb-6" dangerouslySetInnerHTML={{ __html: article.content }} />
                <div className="flex gap-2 flex-wrap">
                    {tags.map((tag) => (
                        <span key={tag} className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            #{tag}
                        </span>
                    ))}
                </div>
                <Link href="/" className="inline-block mt-8 text-blue-600 hover:underline">
                    ← Back to Home
                </Link>
            </div>
        </>
    )
}