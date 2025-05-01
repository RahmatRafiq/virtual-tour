import React, { useRef, useEffect } from 'react';
import { usePage, Head } from '@inertiajs/react';
import { Viewer } from 'photo-sphere-viewer';
import { MarkersPlugin } from 'photo-sphere-viewer/dist/plugins/markers';
import 'photo-sphere-viewer/dist/photo-sphere-viewer.css';
import 'photo-sphere-viewer/dist/plugins/markers.css';
import AppLayout from '@/layouts/app-layout';
import VirtualTourLayout from '@/layouts/VirtualTours/Layout';
import { BreadcrumbItem } from '@/types';

type Hotspot = {
    id: number;
    type: 'navigation' | 'info';
    yaw: number;
    pitch: number;
    tooltip: string | null;
    content: string | null;
    target_sphere: { id: number; name: string } | null;
};

type Sphere = {
    id: number;
    name: string;
    panorama_url?: string;
    hotspots: Hotspot[];
    media: { original_url: string }[];
};

type VirtualTour = {
    id: number;
    name: string;
    description: string;
    spheres: Sphere[];
};

export default function Show() {
    const { virtualTour } = usePage<{ virtualTour: VirtualTour }>().props;
    const containerRefs = useRef<Record<number, HTMLDivElement | null>>({});
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Virtual Tours', href: '/virtual-tour' },
        { title: virtualTour.name, href: route('virtual-tour.show', virtualTour.id) },
    ];

    useEffect(() => {
        virtualTour.spheres.forEach((sphere) => {
            const container = containerRefs.current[sphere.id];
            if (!container) return;

            const panoramaUrl = sphere.media[0]?.original_url;

            if (!panoramaUrl) {
                console.warn(`No panorama URL found for sphere ID: ${sphere.id}`);
                return;
            }

            const viewer = new Viewer({
                container,
                panorama: panoramaUrl,
                defaultLat: 0,
                navbar: ['zoom', 'fullscreen'],
                plugins: [
                    [MarkersPlugin, {
                        markers: sphere.hotspots.map((h) => ({
                            id: String(h.id),
                            position: { yaw: `${h.yaw}deg`, pitch: `${h.pitch}deg` },
                            svg: `<circle cx="12" cy="12" r="8" fill="${h.type === 'navigation' ? 'rgba(0,150,136,0.7)' : 'rgba(33,150,243,0.7)'
                                }" />`,
                            anchor: 'center center',
                            tooltip: h.tooltip || undefined,
                        })),
                    }],
                ],
            });

            const markers = viewer.getPlugin(MarkersPlugin);
            if (!markers) return;
            markers.on('select-marker', (e: unknown, marker: { id: string }) => {
                const h = sphere.hotspots.find((x) => String(x.id) === marker.id);
                if (h?.type === 'navigation' && h.target_sphere) {
                    window.location.href = route('virtual-tour.show', h.target_sphere.id);
                } else if (h?.type === 'info') {
                    alert(h.content);
                }
            });

            return () => viewer.destroy();
        });
    }, [virtualTour.spheres]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={virtualTour.name} />
            <VirtualTourLayout>
                <div className="p-6 space-y-8">
                    <h1 className="text-3xl font-bold">{virtualTour.name}</h1>
                    <p className="text-gray-600">{virtualTour.description}</p>

                    {virtualTour.spheres.map((sphere) => (
                        <div key={sphere.id} className="border rounded-lg overflow-hidden">
                            <h2 className="bg-gray-100 px-4 py-2 text-xl">{sphere.name}</h2>
                            <div
                                ref={(el) => { containerRefs.current[sphere.id] = el; }}
                                style={{ width: '100%', height: '500px' }}
                            />
                        </div>
                    ))}
                </div>
            </VirtualTourLayout>
        </AppLayout>
    );
}
