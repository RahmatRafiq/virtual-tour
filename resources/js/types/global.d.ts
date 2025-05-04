import type { route as routeFn } from 'ziggy-js';

declare global {
    const route: typeof routeFn;
}
declare module '@photo-sphere-viewer/markers-plugin' {
    import { AbstractPlugin } from '@photo-sphere-viewer/core';

    export class MarkersPlugin extends AbstractPlugin {
        clearMarkers(): void;
        addMarker(marker: { id: string;[key: string]: unknown }): void;
        //   on(event: string, callback: (event: { type: string; [key: string]: unknown }) => void): void;
        on(event: 'select-marker', listener: (e: { marker: { id: string } }) => void): this;

    }

    export default MarkersPlugin;
}