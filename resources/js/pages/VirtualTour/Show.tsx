import { useRef, useEffect, useState } from 'react';
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

  useEffect(() => {
    console.log('⏳ Initializing PSV Viewer');
    if (!containerRef.current) return;
    viewerRef.current = new Viewer({
      container: containerRef.current,
      panorama: '',
      defaultLat: toRad(0),
      defaultLong: toRad(0),
      navbar: ['zoom', 'fullscreen'],
      plugins: [[MarkersPlugin, { markers: [] }]],
    });
    console.log('✅ Viewer initialized');
    return () => {
      viewerRef.current?.destroy();
      console.log('🗑 Viewer destroyed');
    };
  }, []);

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
      const markersPlugin = viewerRef.current?.getPlugin(MarkersPlugin);
      if (!markersPlugin) {
        console.error('❌ MarkersPlugin not initialized');
        return;
      }
      console.log('✅ MarkersPlugin initialized');

      console.log('🧹 Clearing existing markers');
      markersPlugin.clearMarkers();
      console.log('Hotspots data:', sphere.hotspots);
      console.log('🔖 Adding markers:', sphere.hotspots.length);
      sphere.hotspots.forEach(h => {
        console.log(`  ➤ Marker ${h.id}: yaw=${h.yaw}, pitch=${h.pitch}, type=${h.type}`);

        const longitude = toRad(h.yaw);
        const latitude = toRad(h.pitch);
        console.log(`Converted coordinates: longitude=${longitude}, latitude=${latitude}`);

        markersPlugin.addMarker({
          id: String(h.id),
          longitude,
          visible: true,
          latitude,
          html: `<div style="width:40px;height:40px;background:red;color:white;display:flex;align-items:center;justify-content:center;border-radius:50%">M</div>`,

          anchor: 'center center',
          tooltip: h.tooltip || undefined,
        });
        setTimeout(() => {
          const markerElement = document.querySelector(`[data-marker-id="${h.id}"]`);
          console.log(`🔍 DOM for marker ${h.id}:`, markerElement);
          if (markerElement instanceof HTMLElement) {
            const rect = markerElement.getBoundingClientRect();
            console.log(`📐 Marker ${h.id} position and size:`, rect);
          } else {
            console.warn(`⚠️ Marker DOM for ${h.id} not found`);
          }
        }, 500);
        
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
