import React from 'react'
import { Head } from '@inertiajs/react'
import { HomeProps } from '@/types/Home'

export default function Home({ hero, articles, virtualTours }: HomeProps) {
  return (
    <>
      <Head title="Home" />
      <main className="space-y-16">

        {/* Hero */}
        <section className="bg-gray-100 py-20 text-center">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-4xl font-bold">{hero.title}</h1>
            <p className="mt-4 text-lg text-gray-700">{hero.subtitle}</p>
            <a
              href={hero.cta.link}
              className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
            >
              {hero.cta.label}
            </a>
          </div>
        </section>

        {/* Articles */}
        <section id="articles" className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-semibold mb-6">Latest Articles</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <a
                key={article.id}
                href={`/articles/${article.slug}`}
                className="border rounded-xl overflow-hidden hover:shadow-lg transition"
              >
                {/* Cover Image */}
                {article.coverImage ? (
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-200 flex items-center justify-center text-gray-500">
                    No Cover
                  </div>
                )}

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold">{article.title}</h3>
                  <p className="text-sm text-gray-500">{article.category}</p>
                  <p className="mt-2 text-gray-700 text-sm">{article.excerpt}</p>
                  <div className="mt-3 flex flex-wrap gap-1 text-xs text-blue-600">
                    {article.tags.map((tag) => (
                      <span key={tag} className="bg-blue-100 px-2 py-0.5 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Virtual Tours */}
        <section id="tours" className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-semibold mb-6">Featured Virtual Tours</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {virtualTours.map((tour) => (
              <a
                key={tour.id}
                href={`/tours/${tour.id}`}
                className="border rounded-xl overflow-hidden hover:shadow-lg transition"
              >
                {/* Preview Image */}
                {tour.previewImage ? (
                  <img
                    src={tour.previewImage}
                    alt={tour.name}
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-200 flex items-center justify-center text-gray-500">
                    No Image
                  </div>
                )}

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold">{tour.name}</h3>
                  <p className="text-sm text-gray-500">{tour.category}</p>
                  <p className="mt-2 text-gray-700 text-sm">{tour.description}</p>
                  <p className="mt-2 text-xs text-gray-400">
                    {tour.sphereCount} sphere{tour.sphereCount !== 1 && 's'}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}
