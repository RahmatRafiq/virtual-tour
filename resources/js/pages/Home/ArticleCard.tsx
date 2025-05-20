// resources/js/Components/ArticleCard.tsx
import React from 'react'
import * as Tooltip from '@radix-ui/react-tooltip'
import type { ArticlePreview } from '@/types/Home'

interface Props {
  article: ArticlePreview
}

export function ArticleCard({ article }: Props) {
  return (
    <a
      href={`/articles/${article.slug}`}
      className="block bg-white rounded-2xl shadow hover:shadow-xl transition-all duration-200 overflow-hidden border border-gray-100 hover:border-blue-200"
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
                <Tooltip.Content
                  side="top"
                  align="center"
                  className="px-3 py-1 rounded bg-gray-800 text-white text-xs"
                >
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
