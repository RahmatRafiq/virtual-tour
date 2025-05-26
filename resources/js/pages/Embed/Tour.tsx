import React, { useState } from 'react';
import SphereViewer from '@/components/SphereViewer';
import type { VirtualTour } from '@/types/SphereView';

interface EmbedTourProps { tour: VirtualTour }
export default function EmbedTour({ tour }: EmbedTourProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Pastikan sphere selalu valid
    const sphere = tour.spheres?.[currentIndex];
    if (!sphere) return <div>Sphere tidak ditemukan.</div>;

    // Debug: tampilkan info sphere dan hotspot
    console.log('Current Sphere:', sphere);
    console.log('Hotspots:', sphere.hotspots);
    console.log('Media:', sphere.media);

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <SphereViewer
                sphere={sphere}
                initialYaw={sphere.initial_yaw}
                onNavigateSphere={(id) => {
                    const idx = tour.spheres.findIndex(s => s.id === id);
                    if (idx !== -1) setCurrentIndex(idx);
                }}
            />
        </div>
    );
}