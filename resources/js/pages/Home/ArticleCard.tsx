import React from 'react'
import * as Tooltip from '@radix-ui/react-tooltip'
import * as HoverCard from '@radix-ui/react-hover-card'
import type { ArticlePreview } from '@/types/Home'
import { Link } from '@inertiajs/react'

interface Props {
    article: ArticlePreview
}

export function ArticleCard({ article }: Props) {
    return (
        <HoverCard.Root openDelay={200}>
            <HoverCard.Trigger asChild>
                <Link
                    href={`/articles/${article.slug}`}
                    className="group relative flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 h-full"
                >
                    <div className="relative h-48">
                        <img
                            src={article.coverImage ?? `https://picsum.photos/seed/article-${article.id}/400/300`}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                        <div className="absolute bottom-4 left-4 flex flex-wrap gap-1">
                            {article.tags.slice(0, 3).map((tag) => (
                                <Tooltip.Root key={tag}>
                                    <Tooltip.Trigger asChild>
                                        <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full cursor-help">
                                            #{tag}
                                        </span>
                                    </Tooltip.Trigger>
                                    <Tooltip.Portal>
                                        <Tooltip.Content
                                            side="top"
                                            align="center"
                                            className="px-3 py-1 rounded bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 text-xs"
                                        >
                                            {tag}
                                            <Tooltip.Arrow className="fill-current text-gray-800 dark:text-gray-200" />
                                        </Tooltip.Content>
                                    </Tooltip.Portal>
                                </Tooltip.Root>
                            ))}
                            {article.tags.length > 3 && (
                                <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                                    +{article.tags.length - 3}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex-1 p-6 flex flex-col">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{article.title}</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{article.category}</p>
                        <div className="mt-2 text-gray-700 dark:text-gray-300 text-sm line-clamp-3">{article.excerpt}</div>
                    </div>
                </Link>
            </HoverCard.Trigger>

            <HoverCard.Content
                side="top"
                align="center"
                className="z-20 w-64 rounded-lg bg-white dark:bg-gray-900 p-4 shadow-lg animate-in slide-in-from-bottom-10"
            >
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-6">{article.excerpt}</p>
                <HoverCard.Arrow className="fill-current text-white dark:text-gray-900" />
            </HoverCard.Content>
        </HoverCard.Root>
    )
}