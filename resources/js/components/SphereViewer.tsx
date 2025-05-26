import React, { useRef, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Viewer, PluginConstructor } from '@photo-sphere-viewer/core'
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin'
import { AutorotatePlugin } from '@photo-sphere-viewer/autorotate-plugin'
import '@photo-sphere-viewer/core/index.css'
import '@photo-sphere-viewer/markers-plugin/index.css'
import HotspotMarker from '@/components/HotspotMarker'
import type { MarkersPluginWithEvents, Sphere } from '@/types/SphereView'

interface SphereViewerProps {
    sphere: Sphere
    initialYaw?: number
    onNavigateSphere: (targetId: number) => void
}

export default function SphereViewer({ sphere, initialYaw = 0, onNavigateSphere }: SphereViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const viewerRef = useRef<Viewer | null>(null)
    const autorotateRef = useRef<AutorotatePlugin | null>(null)
    const [autoRotate] = useState(false)
    const toRad = (deg: number) => (deg * Math.PI) / 180

    const panoramaUrl = sphere.media.find(
        m => m.mime_type?.startsWith('image/')
    )?.original_url || sphere.media[0]?.original_url || ''

    useEffect(() => {
        if (!containerRef.current || !panoramaUrl) return

        if (viewerRef.current) {
            try {
                viewerRef.current.destroy()
            } catch (e) {
                console.warn('Error saat destroy viewer:', e)
            }
            viewerRef.current = null
            containerRef.current.innerHTML = ''
        }

        const viewer = new Viewer({
            container: containerRef.current,
            panorama: panoramaUrl,
            plugins: [
                [MarkersPlugin as unknown as PluginConstructor, {}],
                [AutorotatePlugin, { autostartDelay: null, autostartOnIdle: false, autorotatePitch: 0 }],
            ],
        })
        viewerRef.current = viewer

        const markers = viewer.getPlugin(
            MarkersPlugin as unknown as PluginConstructor
        ) as unknown as MarkersPluginWithEvents

        autorotateRef.current = viewer.getPlugin(AutorotatePlugin) as AutorotatePlugin

        markers.addEventListener('select-marker', e => {
            const id = parseInt(e.marker.id, 10)
            const hotspot = sphere.hotspots.find(h => h.id === id)
            if (hotspot?.type === 'navigation' && hotspot.target_sphere) {
                onNavigateSphere(hotspot.target_sphere.id)
            }
            if (hotspot?.type === 'info') {
                alert(hotspot.content)
            }
        })

        const onReady = () => {
            markers.clearMarkers()
            sphere.hotspots.forEach(h => {
                const el = document.createElement('div')
                createRoot(el).render(<HotspotMarker hotspot={h} />)
                markers.addMarker({
                    id: String(h.id),
                    position: { yaw: toRad(h.yaw), pitch: toRad(h.pitch) },
                    element: el,
                    anchor: 'center bottom',
                })
            })
            if (autorotateRef.current) {
                if (autoRotate) {
                    autorotateRef.current.start()
                    viewer.setOptions({ mousemove: true, mousewheel: true })
                } else {
                    autorotateRef.current.stop()
                }
            }
            viewer.rotate({ yaw: toRad(initialYaw), pitch: 0 })
            viewer.removeEventListener('ready', onReady)
        }
        viewer.addEventListener('ready', onReady)

        return () => {
            if (viewerRef.current) {
                try {
                    viewerRef.current.destroy()
                } catch (e) {
                    console.warn('Error saat destroy viewer:', e)
                }
                viewerRef.current = null
            }
            if (containerRef.current) {
                containerRef.current.innerHTML = ''
            }
        }
    }, [sphere, onNavigateSphere, panoramaUrl, initialYaw, autoRotate])
    return (
        <div className="relative">
            {!panoramaUrl ? (
                <div>Panorama tidak ditemukan untuk sphere ini.</div>
            ) : (
                <div
                    ref={containerRef}
                    className="w-full h-[420px] md:h-[500px] bg-black rounded-lg overflow-hidden"
                />
            )}
        </div>
    )
}
