import React, { useRef, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Head, Link } from '@inertiajs/react'
import { Viewer, PluginConstructor } from '@photo-sphere-viewer/core'
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin'
import '@photo-sphere-viewer/core/index.css'
import '@photo-sphere-viewer/markers-plugin/index.css'
import HotspotMarker from '@/components/HotspotMarker'
import type { MarkersPluginWithEvents, VirtualTour } from '@/types/SphereView'
import { Header } from '../Header'

interface TourShowProps {
  tour: VirtualTour
}

export default function Show({ tour }: TourShowProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<Viewer | null>(null)

  const toRad = (deg: number) => (deg * Math.PI) / 180

  useEffect(() => {
    if (!containerRef.current) return

    const firstSphere = tour.spheres[0]
    const firstPanoramaUrl = firstSphere?.media?.[0]?.original_url
    if (!firstPanoramaUrl) return

    const viewer = new Viewer({
      container: containerRef.current,
      panorama: firstPanoramaUrl,
      plugins: [[MarkersPlugin as unknown as PluginConstructor, {}]],
    })
    viewerRef.current = viewer

    const markersPlugin =
      viewer.getPlugin(MarkersPlugin as unknown as PluginConstructor) as unknown as MarkersPluginWithEvents

    markersPlugin.addEventListener('select-marker', (event: { marker: { id: string } }) => {
      const markerId = event.marker.id
      const hotspot = tour.spheres[currentIndex].hotspots.find(
        (h) => String(h.id) === markerId
      )
      if (!hotspot) return

      if (hotspot.type === 'navigation' && hotspot.target_sphere) {
        const targetIndex = tour.spheres.findIndex(
          (s) => hotspot.target_sphere && s.id === hotspot.target_sphere.id
        )
        if (targetIndex >= 0) setCurrentIndex(targetIndex)
      } else if (hotspot.type === 'info') {
        alert(hotspot.content)
      }
    })

    return () => viewer.destroy()
  }, [currentIndex, tour.spheres])

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer) return

    const markersPlugin =
      viewer.getPlugin(MarkersPlugin as unknown as PluginConstructor) as unknown as MarkersPluginWithEvents
    const sphere = tour.spheres[currentIndex]
    const url = sphere.media[0]?.original_url
    if (!url) return

    viewer
      .setPanorama(url)
      .then(() => {
        markersPlugin.clearMarkers()
        sphere.hotspots.forEach((hotspot) => {
          const markerEl = document.createElement('div')
          createRoot(markerEl).render(<HotspotMarker hotspot={hotspot} />)
          markersPlugin.addMarker({
            id: String(hotspot.id),
            position: { yaw: toRad(hotspot.yaw), pitch: toRad(hotspot.pitch) },
            element: markerEl,
            anchor: 'center bottom',
          })
        })
      })
      .catch(console.error)
  }, [currentIndex, tour.spheres])

  const sphere = tour.spheres[currentIndex]

  return (
    <>
      <Header />
      <Head title={tour.name} />
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold mb-2 text-gray-900">{tour.name}</h1>
          <div className="flex items-center gap-4 mb-2">
            <span className="text-sm text-blue-700 font-semibold uppercase tracking-wide">{tour.category?.name}</span>
            <span className="text-xs text-gray-400">{tour.spheres.length} Sphere{tour.spheres.length > 1 ? 's' : ''}</span>
          </div>
          <p className="text-gray-600">{tour.description}</p>
        </div>
        {sphere ? (
          <div className="border rounded-2xl shadow-lg bg-gray-50 overflow-hidden mb-8">
            <div className="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-blue-50 to-blue-100 border-b">
              <h2 className="text-lg font-semibold text-blue-900">{sphere.name}</h2>
              <div className="flex gap-2">
                {tour.spheres.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                      idx === currentIndex
                        ? 'bg-blue-600 text-white shadow'
                        : 'bg-gray-200 text-gray-700 hover:bg-blue-100'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
            <div ref={containerRef} style={{ width: '100%', height: 420 }} className="bg-black" />
            <div className="px-6 py-4">
              <strong className="block mb-2 text-gray-700">Hotspots:</strong>
              <ul className="list-disc ml-6 text-gray-800">
                {sphere.hotspots.length === 0 && (
                  <li className="text-gray-400 italic">No hotspots.</li>
                )}
                {sphere.hotspots.map((h) => (
                  <li key={h.id}>
                    <span className="font-semibold">{h.type}</span>
                    {h.tooltip && <> – <span>{h.tooltip}</span></>}
                    {h.target_sphere && (
                      <span className="ml-2 text-xs text-blue-700">(Target: {h.target_sphere.name})</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-gray-500">No sphere available.</div>
        )}

        <Link href="/" className="inline-block mt-8 text-blue-600 hover:underline">
          ← Back to Home
        </Link>
      </div>
    </>
  )
}