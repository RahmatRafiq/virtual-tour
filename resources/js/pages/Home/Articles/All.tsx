import { Head, Link, router } from '@inertiajs/react'
import { ArticleCard } from '../ArticleCard'
import { Header } from '../Header'
import { Footer } from '../Footer'
import * as Tooltip from '@radix-ui/react-tooltip'
import { Category } from '@/types/Article'
import { ArticlePreview, Pagination } from '@/types/Content'


interface AllProps {
    articles: ArticlePreview[]
    categories: Category[]
    activeCategory?: string | null
    pagination: Pagination
}

export default function All({ articles, categories, activeCategory, pagination }: AllProps) {
    return (
        <Tooltip.Provider>
            <Header />
            <div className="max-w-6xl mx-auto py-12 px-4">
                <Head title="All Articles" />
                <h1 className="text-3xl font-bold mb-6">All Articles</h1>
                <div className="mb-8 flex gap-2 flex-wrap">
                    <button
                        className={`px-4 py-2 rounded-full ${!activeCategory ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
                        onClick={() => router.get('/articles')}
                    >
                        All
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            className={`px-4 py-2 rounded-full ${activeCategory === cat.name ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
                            onClick={() => router.get('/articles', { category: cat.name })}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {articles.length === 0 && (
                        <div className="col-span-full text-gray-500">No articles found.</div>
                    )}
                    {articles.map(article => (
                        <ArticleCard
                            key={article.id}
                            article={{
                                ...article,
                                tags: Array.isArray(article.tags) ? article.tags : [],
                            }}
                        />
                    ))}
                </div>
                {/* Pagination */}
                <div className="mt-8 flex justify-center gap-2">
                    {Array.from({ length: pagination.last_page }, (_, i) => (
                        <button
                            key={i + 1}
                            className={`px-3 py-1 rounded ${pagination.current_page === i + 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
                            onClick={() => router.get('/articles', { page: i + 1, ...(activeCategory ? { category: activeCategory } : {}) })}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
                <div className="mt-8">
                    <Link href="/" className="text-blue-600 hover:underline">← Back to Home</Link>
                </div>
            </div>
            <Footer />
        </Tooltip.Provider>
    )
}