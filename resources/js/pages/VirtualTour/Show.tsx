import { useRef, useEffect, useState } from 'react';
import { usePage, Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Viewer, PluginConstructor } from '@photo-sphere-viewer/core';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import VirtualTourLayout from '@/layouts/VirtualTours/Layout';
import { BreadcrumbItem } from '@/types';
import '@photo-sphere-viewer/core/index.css';
import '@photo-sphere-viewer/markers-plugin/index.css';

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
  media: { original_url: string }[];
  hotspots: Hotspot[];
};

type VirtualTour = {
  id: number;
  name: string;
  description: string;
  spheres: Sphere[];
};

export default function Show() {
  const { virtualTour } = usePage<{ virtualTour: VirtualTour }>().props;
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Virtual Tours', href: '/virtual-tour' },
    { title: virtualTour.name, href: route('virtual-tour.show', virtualTour.id) },
  ];

  useEffect(() => {
    if (!containerRef.current) return;

    const viewer = new Viewer({
      container: containerRef.current,
      panorama: virtualTour.spheres[0].media[0].original_url, // Set panorama awal
      plugins: [
        [MarkersPlugin as unknown as PluginConstructor, {}], // Tambahkan plugin markers
      ],
    });

    viewerRef.current = viewer;

    const markersPlugin = viewer.getPlugin(MarkersPlugin as unknown as PluginConstructor) as unknown as MarkersPlugin;

    // Tambahkan event listener untuk marker
    markersPlugin.on('select-marker', (event: { marker: { id: string } }) => {
      const marker = event.marker;
      const currentSphere = virtualTour.spheres[currentIndex];
      const hotspot = currentSphere.hotspots.find(h => String(h.id) === marker.id);

      if (!hotspot) return;

      if (hotspot.type === 'navigation' && hotspot.target_sphere) {
        const targetIndex = virtualTour.spheres.findIndex(s => s.id === hotspot.target_sphere!.id);
        if (targetIndex >= 0) setCurrentIndex(targetIndex);
      } else if (hotspot.type === 'info') {
        alert(hotspot.content);
      }
    });

    return () => viewer.destroy();
  }, [virtualTour, currentIndex]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    const markersPlugin = viewer.getPlugin(MarkersPlugin as unknown as PluginConstructor) as unknown as MarkersPlugin;
    const sphere = virtualTour.spheres[currentIndex];
    const url = sphere.media[0]?.original_url;

    if (!markersPlugin || !url) return;

    viewer.setPanorama(url).then(() => {
      markersPlugin.clearMarkers();

      sphere.hotspots.forEach(hotspot => {
        markersPlugin.addMarker({
          id: String(hotspot.id),
          position: { yaw: toRad(hotspot.yaw), pitch: toRad(hotspot.pitch) },
          tooltip: hotspot.tooltip || undefined,
          html: `<div style="background: red; color: white; padding: 5px; border-radius: 5px;">${hotspot.type}</div>`,
        });
      });
    }).catch(console.error);
  }, [currentIndex, virtualTour.spheres]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={virtualTour.name} />
      <VirtualTourLayout>
        <div className="p-6 space-y-8">
          <h1 className="text-3xl font-bold">{virtualTour.name}</h1>
          <p className="text-gray-600">{virtualTour.description}</p>
          <div className="border rounded-lg overflow-hidden">
            <h2 className="bg-gray-100 px-4 py-2 text-xl">
              {virtualTour.spheres[currentIndex].name}
            </h2>
            <div ref={containerRef} style={{ width: '100%', height: '500px' }} />
          </div>
        </div>
      </VirtualTourLayout>
    </AppLayout>
  );
}