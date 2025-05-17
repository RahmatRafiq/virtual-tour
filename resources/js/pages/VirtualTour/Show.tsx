import { useRef, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { usePage, Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import VirtualTourLayout from '@/layouts/VirtualTours/Layout';
import { Viewer, PluginConstructor } from '@photo-sphere-viewer/core';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import { BreadcrumbItem } from '@/types';
import { VirtualTour, MarkersPluginWithEvents } from '@/types/SphereView';
import '@photo-sphere-viewer/core/index.css';
import '@photo-sphere-viewer/markers-plugin/index.css';
import HotspotMarker from '@/components/HotspotMarker';

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

    const firstSphere = virtualTour.spheres[0];
    const firstPanoramaUrl = firstSphere?.media?.[0]?.original_url;
    if (!firstPanoramaUrl) return;

    const viewer = new Viewer({
      container: containerRef.current,
      panorama: firstPanoramaUrl,
      plugins: [[MarkersPlugin as unknown as PluginConstructor, {}]],
    });
    viewerRef.current = viewer;

    const markersPlugin =
      viewer.getPlugin(MarkersPlugin as unknown as PluginConstructor) as unknown as MarkersPluginWithEvents;

    markersPlugin.addEventListener('select-marker', (event: { marker: { id: string } }) => {
      const markerId = event.marker.id;
      const hotspot = virtualTour.spheres[currentIndex].hotspots.find(
        (h) => String(h.id) === markerId
      );
      if (!hotspot) return;

      if (hotspot.type === 'navigation' && hotspot.target_sphere) {
        const targetIndex = virtualTour.spheres.findIndex(
          (s) => hotspot.target_sphere && s.id === hotspot.target_sphere.id
        );
        if (targetIndex >= 0) setCurrentIndex(targetIndex);
      } else if (hotspot.type === 'info') {
        alert(hotspot.content);
      }
    });

    return () => viewer.destroy();
  }, [currentIndex, virtualTour.spheres]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    const markersPlugin =
      viewer.getPlugin(MarkersPlugin as unknown as PluginConstructor) as unknown as MarkersPluginWithEvents;
    const sphere = virtualTour.spheres[currentIndex];
    const url = sphere.media[0]?.original_url;
    if (!url) return;

    viewer
      .setPanorama(url)
      .then(() => {
        markersPlugin.clearMarkers();

        sphere.hotspots.forEach((hotspot) => {
          const markerEl = document.createElement('div');
          createRoot(markerEl).render(<HotspotMarker hotspot={hotspot} />);

          markersPlugin.addMarker({
            id: String(hotspot.id),
            position: { yaw: toRad(hotspot.yaw), pitch: toRad(hotspot.pitch) },
            element: markerEl,
            anchor: 'center bottom',
          });
        });
      })
      .catch(console.error);
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
              {virtualTour.spheres[currentIndex]?.name ?? 'No Sphere'}
            </h2>
            <div ref={containerRef} style={{ width: '100%', height: '500px' }} />
          </div>
        </div>
      </VirtualTourLayout>
    </AppLayout>
  );
}