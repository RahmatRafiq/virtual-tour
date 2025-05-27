import React, { useState, useEffect } from 'react'
import SphereViewer from '@/components/SphereViewer'
import type { VirtualTour } from '@/types/SphereView'

interface EmbedTourProps { tour: VirtualTour }
export default function EmbedTour({ tour }: EmbedTourProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (mounted) {
            setCurrentIndex(0)
        }
    }, [mounted])

    const sphere = tour.spheres?.[currentIndex]
    if (!sphere) return <div>Sphere tidak ditemukan.</div>
    if (!mounted) return <div>Loading...</div>

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <SphereViewer
                sphere={sphere}
                initialYaw={sphere.initial_yaw}
                onNavigateSphere={(id) => {
                    const idx = tour.spheres.findIndex(s => s.id === id)
                    if (idx !== -1) setCurrentIndex(idx)
                }}
            />
        </div>
    )
}
