// resources/js/Pages/Home.tsx

import React from 'react'
import { Head } from '@inertiajs/react'
import type { HomeProps } from '@/types/Home'
import * as NavigationMenu from '@radix-ui/react-navigation-menu'
import * as Tooltip from '@radix-ui/react-tooltip'
import { ArticleCard } from './Home/ArticleCard'
import { TourCard } from './Home/TourCard'
import { Header } from './Home/Header'
import { HeroSection } from './Home/HeroSection'
import { Section } from './Home/Section'
import { Footer } from './Home/Footer'


export default function Home({ hero, articles, virtualTours }: HomeProps) {
  return (
    <Tooltip.Provider>
      <Head title="Home" />
      <Header />

      <main className="space-y-32 pt-8">
        <HeroSection {...hero} />

        <div className="max-w-6xl mx-auto px-4">
          <NavigationMenu.Root>
            <NavigationMenu.List className="flex space-x-8 border-b pb-2 mb-12">
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
        </div>

        <section id="articles" className="container mx-auto px-4">
          <Section title="Latest Articles" href="/articles" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>

        <section id="tours" className="container mx-auto px-4">
          <Section title="Virtual Tours" href="/tours" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {virtualTours.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </Tooltip.Provider>
  )
}
