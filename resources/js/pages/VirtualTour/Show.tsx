import React, { useRef, useEffect, useState } from 'react';
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
  const viewerRef = useRef<Viewer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Virtual Tours', href: '/virtual-tour' },
    { title: virtualTour.name, href: route('virtual-tour.show', virtualTour.id) },
  ];

  function toRad(deg: number) {
    return deg * Math.PI / 180;
  }

  // 1) Instantiate viewer once
  useEffect(() => {
    console.log('⏳ Initializing PSV Viewer');
    if (!containerRef.current) return;
    viewerRef.current = new Viewer({
      container: containerRef.current,
      panorama: '',
      defaultLat: 0,
      navbar: ['zoom', 'fullscreen'],
      plugins: [[MarkersPlugin, { markers: [] }]],
    });
    console.log('✅ Viewer initialized');
    return () => {
      viewerRef.current?.destroy();
      console.log('🗑 Viewer destroyed');
    };
  }, []);

  // 2) On sphere change: load panorama & markers
  useEffect(() => {
    const sphere = virtualTour.spheres[currentIndex];
    console.log(`\n🔄 Loading sphere index ${currentIndex}: "${sphere.name}"`);
    const url = sphere.media[0]?.original_url;
    console.log('🌄 Panorama URL:', url);
    if (!viewerRef.current) {
      console.warn('⚠️ viewerRef.current is null, skipping');
      return;
    }
    if (!url) {
      console.warn('⚠️ No panorama URL, skipping markers');
      return;
    }

    console.log('⏳ Setting panorama...');
    viewerRef.current.setPanorama(url).then(() => {
      console.log('✅ Panorama set:', url);

      const markersPlugin = viewerRef.current!.getPlugin(MarkersPlugin)!;
      console.log('🧹 Clearing existing markers');
      markersPlugin.clearMarkers();

      console.log('🔖 Adding markers:', sphere.hotspots.length);
      sphere.hotspots.forEach(h => {
        console.log(`  ➤ Marker ${h.id}: yaw=${h.yaw}, pitch=${h.pitch}, type=${h.type}`);
        markersPlugin.addMarker({
          id: String(h.id),
          longitude: toRad(h.yaw),
          latitude: toRad(h.pitch),
          tooltip: h.tooltip || undefined,
          anchor: 'center center',
          circle: 20,
          style: {
            fill: h.type === 'navigation'
              ? 'rgba(0,150,136,0.8)'
              : 'rgba(33,150,243,0.8)',
            stroke: '#fff',
            strokeWidth: '2',
          },
        });
      });
      console.log('✅ Markers added');

      console.log('🎯 Binding select-marker event');
      markersPlugin.off('select-marker');
      markersPlugin.on('select-marker', (_e, marker: { id: string }) => {
        console.log('🖱 Marker clicked:', marker.id);
        const h = sphere.hotspots.find(x => String(x.id) === marker.id);
        if (!h) {
          console.warn('⚠️ No hotspot data for marker', marker.id);
          return;
        }
        if (h.type === 'navigation' && h.target_sphere) {
          const idx = virtualTour.spheres.findIndex(s => s.id === h.target_sphere!.id);
          console.log(`🔀 Navigation hotspot to sphere id=${h.target_sphere.id}, found index=${idx}`);
          if (idx >= 0) setCurrentIndex(idx);
        } else if (h.type === 'info') {
          console.log('💡 Info hotspot content:', h.content);
          alert(h.content);
        }
      });
    }).catch(err => {
      console.error('❌ setPanorama error', err);
    });
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
            <div
              ref={containerRef}
              style={{ width: '100%', height: '500px' }}
            />
          </div>
        </div>
      </VirtualTourLayout>
    </AppLayout>
  );
}
