import React from 'react'
import { Head, Link } from '@inertiajs/react'
import { Header } from '../Header'
import { Footer } from '../Footer'

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
        : `https://picsum.photos/seed/article-${article.id}/400/300`

    return (
        <>
            <Header />
            <Head title={article.title} />
            <div className="max-w-3xl mx-auto py-12 px-4">
                <div className="relative mb-8 rounded-2xl overflow-hidden shadow-lg bg-gray-100 dark:bg-gray-900">
                    <div className="w-full aspect-video bg-gray-200 dark:bg-gray-800">
                        <img
                            src={imageUrl}
                            alt={article.title}
                            className="w-full h-full object-contain object-center transition-all duration-300"
                        />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                        <div className="flex gap-2 flex-wrap">
                            {tags.map((tag) => (
                                <span key={tag} className="px-3 py-1 text-xs bg-blue-600/80 dark:bg-blue-400/80 text-white dark:text-gray-900 rounded-full shadow">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-blue-700 dark:text-blue-400 font-semibold uppercase tracking-wide">{article.category}</span>
                    <Link
                        href="/"
                        className="text-xs text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition"
                    >
                        ← Back to Home
                    </Link>
                </div>
                <h1 className="text-4xl font-extrabold mb-6 text-gray-900 dark:text-gray-100 leading-tight">{article.title}</h1>
                <article className="prose prose-lg max-w-none mb-10 dark:prose-invert">
                    <div dangerouslySetInnerHTML={{ __html: article.content }} />
                </article>
                <div className="flex gap-2 flex-wrap mt-8 md:hidden">
                    {tags.map((tag) => (
                        <span key={tag} className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                            #{tag}
                        </span>
                    ))}
                </div>
            </div>
            <Footer />
        </>
    )
}