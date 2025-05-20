// resources/js/Components/TourCard.tsx
import React from 'react'
import type { VirtualTourPreview } from '@/types/Home'

interface Props {
  tour: VirtualTourPreview
}

export function TourCard({ tour }: Props) {
  return (
    <a
      href={`/tours/${tour.id}`}
      className="block bg-white rounded-2xl shadow hover:shadow-xl transition-all duration-200 overflow-hidden border border-gray-100 hover:border-indigo-200"
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
          <svg
            className="w-5 h-5 mr-1 text-indigo-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M4 3a.75.75 0 000 1.5h12a.75.75 0 000-1.5H4zM4 9.25a.75.75 0 000 1.5h12a.75.75 0 000-1.5H4zm0 5.25a.75.75 0 000 1.5h12a.75.75 0 000-1.5H4z" />
          </svg>
          {tour.sphereCount} sphere{tour.sphereCount !== 1 && 's'}
        </div>
      </div>
    </a>
  )
}
