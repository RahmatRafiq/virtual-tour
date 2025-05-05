export type Hotspot = {
    id: number;
    type: 'navigation' | 'info';
    yaw: number;
    pitch: number;
    tooltip: string | null;
    content: string | null;
    target_sphere: { id: number; name: string } | null;
    sphere?: {
      id: number;
      name: string;
      sphere_file: string;
      sphere_image: string;
    } | null;
  };
  
  export interface Sphere {
    id: number;
    name: string;
    media: Array<{ original_url: string }>;
    sphere_file: string;
    sphere_image: string;
    hotspots: Hotspot[];
}
  
  export type VirtualTour = {
    id: number;
    name: string;
    description: string;
    spheres: Sphere[];
  };
  
  export interface MarkersPluginWithEvents extends MarkersPlugin {
    addEventListener(
      event: 'select-marker',
      callback: (e: { marker: { id: string } }) => void,
      options?: boolean | AddEventListenerOptions
    ): void;
  
    clearMarkers(): void; // Tambahkan metode ini
    addMarker(marker: {
      id: string;
      position: { yaw: number; pitch: number };
      element: HTMLElement;
      anchor: string;
    }): void; // Tambahkan metode ini
  }