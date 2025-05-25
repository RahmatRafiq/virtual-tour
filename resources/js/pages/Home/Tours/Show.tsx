import React, { useRef, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Head, Link } from '@inertiajs/react'
import { Viewer, PluginConstructor } from '@photo-sphere-viewer/core'
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin'
import '@photo-sphere-viewer/core/index.css'
import '@photo-sphere-viewer/markers-plugin/index.css'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import HotspotMarker from '@/components/HotspotMarker'
import type { MarkersPluginWithEvents, VirtualTour } from '@/types/SphereView'
import { Header } from '../Header'
import { Footer } from '../Footer'

interface TourShowProps {
  tour: VirtualTour
}

export default function Show({ tour }: TourShowProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<Viewer | null>(null)
  const tabsRef = useRef<HTMLDivElement>(null)

  const toRad = (deg: number) => (deg * Math.PI) / 180

  useEffect(() => {
    if (!containerRef.current) return

    const firstSphere = tour.spheres[0]
    const firstUrl = firstSphere?.media?.[0]?.original_url
    if (!firstUrl) return

    const viewer = new Viewer({
      container: containerRef.current,
      panorama: firstUrl,
      plugins: [[MarkersPlugin as unknown as PluginConstructor, {}]],
    })
    viewerRef.current = viewer

    const markers = viewer.getPlugin(
      MarkersPlugin as unknown as PluginConstructor
    ) as unknown as MarkersPluginWithEvents

    markers.addEventListener('select-marker', (e: { marker: { id: string } }) => {
      const id = e.marker.id
      const hotspot = tour.spheres[currentIndex].hotspots.find(h => String(h.id) === id)
      if (!hotspot) return

      if (hotspot.type === 'navigation' && hotspot.target_sphere) {
        const newIndex = tour.spheres.findIndex(s => s.id === hotspot.target_sphere!.id)
        if (newIndex >= 0) setCurrentIndex(newIndex)
      } else if (hotspot.type === 'info') {
        alert(hotspot.content)
      }
    })

    return () => viewer.destroy()
  }, [currentIndex, tour.spheres])

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer) return

    const markers = viewer.getPlugin(
      MarkersPlugin as unknown as PluginConstructor
    ) as unknown as MarkersPluginWithEvents

    const sphere = tour.spheres[currentIndex]
    const url = sphere.media[0]?.original_url
    if (!url) return

    viewer.setPanorama(url).then(() => {
      if (sphere.initial_yaw !== undefined) {
        viewer.rotate({ yaw: toRad(sphere.initial_yaw), pitch: 0 })
      }
      markers.clearMarkers()
      sphere.hotspots.forEach(hotspot => {
        const el = document.createElement('div')
        createRoot(el).render(<HotspotMarker hotspot={hotspot} />)
        markers.addMarker({
          id: String(hotspot.id),
          position: { yaw: toRad(hotspot.yaw), pitch: toRad(hotspot.pitch) },
          element: el,
          anchor: 'center bottom',
        })
      })
    }).catch(console.error)
  }, [currentIndex, tour.spheres])

  useEffect(() => {
    const tabs = tabsRef.current
    if (!tabs) return
    const active = tabs.children[currentIndex] as HTMLElement | undefined
    if (active) {
      active.scrollIntoView({ behavior: 'smooth', inline: 'center' })
    }
  }, [currentIndex])

  const scrollTabs = (offset: number) => {
    tabsRef.current?.scrollBy({ left: offset, behavior: 'smooth' })
  }

  const sphere = tour.spheres[currentIndex]

  return (
    <>
      <Header />
      <Head title={tour.name} />

      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold mb-2 text-gray-900 dark:text-gray-100">
            {tour.name}
          </h1>
          <div className="flex items-center gap-4 mb-2">
            <span className="text-sm text-blue-700 dark:text-blue-400 font-semibold uppercase tracking-wide">
              {tour.category?.name}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {tour.spheres.length} Sphere{tour.spheres.length > 1 ? 's' : ''}
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-300">{tour.description}</p>
        </div>

        {sphere ? (
          <div className="border rounded-2xl shadow-lg bg-gray-50 dark:bg-gray-900 overflow-hidden mb-8">
            <div className="relative bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 border-b">
              <button
                onClick={() => scrollTabs(-200)}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-white dark:bg-gray-800 rounded-full shadow"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <div
                ref={tabsRef}
                className="overflow-x-auto scroll-smooth whitespace-nowrap px-10 py-3"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                {tour.spheres.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`inline-block px-4 py-1 mr-4 rounded-full text-xs font-medium transition ${idx === currentIndex
                      ? 'bg-blue-600 dark:bg-blue-400 text-white dark:text-gray-900'
                      : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-blue-900'
                      }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
              <button
                onClick={() => scrollTabs(200)}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-white dark:bg-gray-800 rounded-full shadow"
              >
                <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>

            <div
              ref={containerRef}
              className="bg-black w-full h-[420px] md:h-[500px]"
            />

            <div className="px-6 py-4">
              <strong className="block mb-2 text-gray-700 dark:text-gray-200">Hotspots:</strong>
              <ul className="list-disc ml-6 text-gray-800 dark:text-gray-200">
                {sphere.hotspots.length === 0 && (
                  <li className="text-gray-400 dark:text-gray-500 italic">No hotspots.</li>
                )}
                {sphere.hotspots.map((h) => (
                  <li key={h.id}>
                    <span className="font-semibold">{h.type}</span>
                    {h.tooltip && <> – <span>{h.tooltip}</span></>}
                    {h.target_sphere && (
                      <span className="ml-2 text-xs text-blue-700 dark:text-blue-400">(Target: {h.target_sphere.name})</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-gray-500 dark:text-gray-400">No sphere available.</div>
        )}

        <Link
          href="/"
          className="inline-block mt-8 text-blue-600 dark:text-blue-400 hover:underline"
        >
          ← Back to Home
        </Link>
      </div>

      <Footer />
    </>
  )
}
