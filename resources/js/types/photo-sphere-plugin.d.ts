// resources/js/types/photo-sphere-plugin.d.ts

declare module '@photo-sphere-viewer/markers-plugin' {
    interface MarkersPlugin {
      /**
       * Fired when a marker is selected (clicked).
       */
      on(event: 'select-marker', listener: (e: unknown, marker: { id: string }) => void): this;
    }
  }
  