import React, { useRef, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Head, Link } from '@inertiajs/react'
import { Viewer, PluginConstructor } from '@photo-sphere-viewer/core'
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin'
import '@photo-sphere-viewer/core/index.css'
import '@photo-sphere-viewer/markers-plugin/index.css'
import HotspotMarker from '@/components/HotspotMarker'
import type { MarkersPluginWithEvents, VirtualTour } from '@/types/SphereView'

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
      <Head title={tour.name} />
      <div className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-2">{tour.name}</h1>
        <div className="mb-4 text-gray-500">{tour.category?.name}</div>
        <p className="mb-6">{tour.description}</p>
        {sphere ? (
          <div className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-2">{sphere.name}</h2>
            <div ref={containerRef} style={{ width: '100%', height: 400 }} />
            <div className="mt-4">
              <strong>Hotspots:</strong>
              <ul className="list-disc ml-6">
                {sphere.hotspots.map((h) => (
                  <li key={h.id}>
                    {h.type} - {h.tooltip}{' '}
                    {h.target_sphere && `(Target: ${h.target_sphere.name})`}
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