import React, { useRef, useEffect, useState } from 'react'
import { Head, Link } from '@inertiajs/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import SphereViewer from '@/components/SphereViewer'
import type { VirtualTour } from '@/types/SphereView'
import { Header } from '../Header'
import { Footer } from '../Footer'

interface TourShowProps {
  tour: VirtualTour
}

export default function Show({ tour }: TourShowProps) {
  // Pilih index pertama dengan media valid
  const initialIndex = tour.spheres.findIndex(
    s => Array.isArray(s.media) && s.media.length > 0
  )
  const [currentIndex, setCurrentIndex] = useState(
    initialIndex >= 0 ? initialIndex : 0
  )
  const tabsRef = useRef<HTMLDivElement>(null)

  // Scroll tab aktif ke tengah
  useEffect(() => {
    const tabs = tabsRef.current
    const active = tabs?.children[currentIndex] as HTMLElement
    active?.scrollIntoView({ inline: 'center', behavior: 'smooth' })
  }, [currentIndex])

  const scrollTabs = (offset: number) => {
    tabsRef.current?.scrollBy({ left: offset, behavior: 'smooth' })
  }

  const sphere = tour.spheres[currentIndex]
  const panoramaUrl =
    sphere.media?.find(m => m.mime_type?.startsWith('image/'))?.original_url ||
    sphere.media?.[0]?.original_url ||
    ''
  const hasMedia = Boolean(panoramaUrl)

  // Jika sphere tidak ada
  if (!sphere) {
    return (
      <>
        <Header />
        <Head title={tour.name} />
        <div className="max-w-4xl mx-auto py-12 px-4">
          <h1 className="text-2xl font-bold mb-4">Sphere not found</h1>
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back to Home
          </Link>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <Head title={tour.name} />
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold mb-2">{tour.name}</h1>
          <p className="text-gray-600">{tour.description}</p>
        </div>

        {/* Tab Navigation */}
        <div className="relative border-b mb-4">
          <button
            onClick={() => scrollTabs(-200)}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 p-2"
          >
            <ChevronLeft />
          </button>
          <div
            ref={tabsRef}
            className="overflow-x-auto whitespace-nowrap scroll-smooth px-10 py-3"
          >
            {tour.spheres.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentIndex(idx)}
                className={`inline-block px-4 py-1 mr-4 rounded-full text-xs font-medium ${idx === currentIndex
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 hover:bg-blue-100'
                  }`}
              >
                {s.name}
              </button>
            ))}
          </div>
          <button
            onClick={() => scrollTabs(200)}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 p-2"
          >
            <ChevronRight />
          </button>
        </div>

        {/* SphereViewport or fallback message */}
        {hasMedia ? (
          <SphereViewer
            key={sphere.id}
            sphere={sphere}
            initialYaw={sphere.initial_yaw}
            onNavigateSphere={targetId => {
              const idx = tour.spheres.findIndex(s => s.id === targetId)
              if (idx !== -1) setCurrentIndex(idx)
            }}
          />
        ) : (
          <div className="w-full h-[420px] md:h-[500px] bg-gray-100 flex items-center justify-center">
            <span className="text-gray-500">
              Media panorama tidak tersedia untuk sphere ini.
            </span>
          </div>
        )}

        {/* Hotspots List */}
        <div className="px-6 py-4">
          <strong>Hotspots:</strong>
          <ul className="list-disc ml-6">
            {sphere.hotspots.length === 0 && (
              <li className="italic">No hotspots.</li>
            )}
            {sphere.hotspots.map(h => (
              <li key={h.id}>
                {h.type} {h.tooltip ?? ''}
              </li>
            ))}
          </ul>
        </div>

        <Link href="/" className="text-blue-600 hover:underline">
          ← Back to Home
        </Link>
      </div>
      <Footer />
    </>
  )
}
