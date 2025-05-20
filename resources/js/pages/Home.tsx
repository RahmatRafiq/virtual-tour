import React from 'react'
import { Head } from '@inertiajs/react'
import type { HomeProps } from '@/types/Home'
import * as NavigationMenu from '@radix-ui/react-navigation-menu'
import * as Tooltip from '@radix-ui/react-tooltip'
import { motion } from 'framer-motion'

export default function Home({ hero, articles, virtualTours }: HomeProps) {
  return (
    <Tooltip.Provider>
      <Head title="Home" />
      <main className="space-y-24">
        <HeroSection {...hero} />

        <NavigationMenu.Root className="max-w-6xl mx-auto px-4">
          <NavigationMenu.List className="flex space-x-8 border-b pb-2">
            <NavigationMenu.Item>
              <NavigationMenu.Link
                href="#articles"
                className="text-lg font-medium hover:text-blue-600 transition"
              >
                Articles
              </NavigationMenu.Link>
            </NavigationMenu.Item>
            <NavigationMenu.Item>
              <NavigationMenu.Link
                href="#tours"
                className="text-lg font-medium hover:text-blue-600 transition"
              >
                Tours
              </NavigationMenu.Link>
            </NavigationMenu.Item>
          </NavigationMenu.List>
        </NavigationMenu.Root>

        <Section id="articles" title="Latest Articles">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </Section>

        <Section id="tours" title="Featured Virtual Tours">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {virtualTours.map((t) => (
              <TourCard key={t.id} tour={t} />
            ))}
          </div>
        </Section>
      </main>
    </Tooltip.Provider>
  )
}

function HeroSection({ title, subtitle, cta }: { title: string; subtitle: string; cta: { label: string; link: string } }) {
  return (
    <section className="relative bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-24 overflow-hidden">
      <div className="relative z-10 max-w-3xl mx-auto text-center px-4">
        <h1 className="text-5xl font-extrabold">{title}</h1>
        <p className="mt-4 text-xl">{subtitle}</p>
        <a
          href={cta.link}
          className="mt-8 inline-block px-8 py-4 bg-white text-blue-600 rounded-full font-semibold hover:bg-gray-100 transition"
        >
          {cta.label}
        </a>
      </div>
      <motion.div
        className="absolute -bottom-20 -right-20 w-96 h-96 bg-white opacity-10 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ loop: Infinity, duration: 120 }}
      />
    </section>
  )
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="max-w-6xl mx-auto px-4">
      <h2 className="text-3xl font-semibold mb-8">{title}</h2>
      {children}
    </section>
  )
}

function ArticleCard({ article }: { article: HomeProps['articles'][0] }) {
  return (
    <a
      href={`/articles/${article.slug}`}
      className="block bg-white rounded-2xl shadow hover:shadow-lg transition overflow-hidden"
    >
      <img
        src={article.coverImage ?? '/images/placeholder-article.png'}
        alt={article.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-6">
        <h3 className="text-xl font-semibold">{article.title}</h3>
        <p className="mt-1 text-sm text-gray-500">{article.category}</p>
        <p className="mt-4 text-gray-700">{article.excerpt}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <Tooltip.Root key={tag}>
              <Tooltip.Trigger asChild>
                <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full cursor-help">
                  #{tag}
                </span>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content side="top" align="center" className="px-3 py-1 rounded bg-gray-800 text-white text-xs">
                  {tag}
                  <Tooltip.Arrow className="fill-current text-gray-800" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          ))}
        </div>
      </div>
    </a>
  )
}

function TourCard({ tour }: { tour: HomeProps['virtualTours'][0] }) {
  return (
    <a
      href={`/tours/${tour.id}`}
      className="block bg-white rounded-2xl shadow hover:shadow-lg transition overflow-hidden"
    >
      <img
        src={tour.previewImage ?? '/images/placeholder-tour.png'}
        alt={tour.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-6">
        <h3 className="text-xl font-semibold">{tour.name}</h3>
        <p className="mt-1 text-sm text-gray-500">{tour.category}</p>
        <p className="mt-4 text-gray-700">{tour.description}</p>
        <div className="mt-4 flex items-center text-sm text-gray-500">
          <svg className="w-5 h-5 mr-1 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 3a.75.75 0 000 1.5h12a.75.75 0 000-1.5H4zM4 9.25a.75.75 0 000 1.5h12a.75.75 0 000-1.5H4zm0 5.25a.75.75 0 000 1.5h12a.75.75 0 000-1.5H4z" />
          </svg>
          {tour.sphereCount} sphere{tour.sphereCount !== 1 && 's'}
        </div>
      </div>
    </a>
  )
}
