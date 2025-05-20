import React from 'react'
import * as HoverCard from '@radix-ui/react-hover-card'
import type { VirtualTourPreview } from '@/types/Home'

interface Props {
    tour: VirtualTourPreview
}

export function TourCard({ tour }: Props) {
    return (
        <HoverCard.Root openDelay={200}>
            <HoverCard.Trigger asChild>
                <a
                    href={`/tours/${tour.id}`}
                    className="relative block bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden border border-gray-100 hover:border-indigo-300"
                >
                    <div className="relative h-48">
                        <img
                            src={tour.previewImage ?? `https://picsum.photos/seed/tour-${tour.id}/400/300`}

                            alt={tour.name}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                        <span className="absolute bottom-4 left-4 bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                            {tour.sphereCount} sphere{tour.sphereCount !== 1 && 's'}
                        </span>
                    </div>
                    <div className="p-6">
                        <h3 className="text-xl font-semibold text-gray-900">{tour.name}</h3>
                        <p className="mt-1 text-sm text-gray-500">{tour.category}</p>
                    </div>
                </a>
            </HoverCard.Trigger>

            <HoverCard.Content
                side="top"
                align="center"
                className="z-20 w-64 rounded-lg bg-white p-4 shadow-lg animate-in fade-in-80"
            >
                <p className="text-sm text-gray-700 line-clamp-4">{tour.description}</p>
                <HoverCard.Arrow className="fill-current text-white" />
            </HoverCard.Content>
        </HoverCard.Root>
    )
}
