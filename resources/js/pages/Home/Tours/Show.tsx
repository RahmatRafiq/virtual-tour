import React from 'react'
import { Head, Link } from '@inertiajs/react'

interface TourShowProps {
  tour: {
    id: number
    name: string
    description: string
    category: string
    spheres: {
      id: number
      name: string
      panorama: string
      hotspots: {
        id: number
        type: string
        tooltip: string
        targetId: number | null
      }[]
    }[]
  }
}

export default function Show({ tour }: TourShowProps) {
  return (
    <>
      <Head title={tour.name} />
      <div className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-2">{tour.name}</h1>
        <div className="mb-4 text-gray-500">{tour.category}</div>
        <p className="mb-6">{tour.description}</p>
        <div className="space-y-8">
          {tour.spheres.map((sphere) => (
            <div key={sphere.id} className="border rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-2">{sphere.name}</h2>
              <img src={sphere.panorama} alt={sphere.name} className="mb-2 rounded" />
              <div>
                <strong>Hotspots:</strong>
                <ul className="list-disc ml-6">
                  {sphere.hotspots.map((h) => (
                    <li key={h.id}>
                      {h.type} - {h.tooltip} {h.targetId && `(Target: ${h.targetId})`}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
        <Link href="/" className="inline-block mt-8 text-blue-600 hover:underline">
          ← Back to Home
        </Link>
      </div>
    </>
  )
}