import React from 'react'
import { Head, Link, router } from '@inertiajs/react'
import { TourCard } from '../TourCard'
import { Category } from '@/types/category'
import { Header } from '../Header'
import { Footer } from '../Footer'


type VirtualTourPreview = {
    id: number
    name: string
    description: string
    category: string
    previewImage: string | null
    sphereCount: number
}

type Pagination = {
    current_page: number
    last_page: number
    per_page: number
    total: number
}

interface AllProps {
    virtualTours: VirtualTourPreview[]
    categories: Category[]
    activeCategory?: string | null
    pagination: Pagination
}

export default function All({ virtualTours, categories, activeCategory, pagination }: AllProps) {
    return (

        <>
            <Header />
            <div className="max-w-6xl mx-auto py-12 px-4">

                <Head title="All Virtual Tours" />
                <h1 className="text-3xl font-bold mb-6">All Virtual Tours</h1>
                <div className="mb-8 flex gap-2 flex-wrap">
                    <button
                        className={`px-4 py-2 rounded-full transition-colors ${!activeCategory
                            ? 'bg-indigo-600 text-white dark:bg-indigo-500 dark:text-white'
                            : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                            }`}
                        onClick={() => router.get('/tours')}
                    >
                        All
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            className={`px-4 py-2 rounded-full transition-colors ${activeCategory === cat.name
                                ? 'bg-indigo-600 text-white dark:bg-indigo-500 dark:text-white'
                                : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                }`}
                            onClick={() => router.get('/tours', { category: cat.name })}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {virtualTours.length === 0 && (
                        <div className="col-span-full text-gray-500">No tours found.</div>
                    )}
                    {virtualTours.map(tour => (
                        <TourCard key={tour.id} tour={tour} />
                    ))}
                </div>
                {/* Pagination */}
                <div className="mt-8 flex justify-center gap-2">
                    {Array.from({ length: pagination.last_page }, (_, i) => (
                        <button
                            key={i + 1}
                            className={`px-3 py-1 rounded ${pagination.current_page === i + 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
                            onClick={() => router.get('/tours', { page: i + 1, ...(activeCategory ? { category: activeCategory } : {}) })}
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
        </>

    )
}