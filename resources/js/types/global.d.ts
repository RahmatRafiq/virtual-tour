import type { route as routeFn } from 'ziggy-js';

declare global {
    const route: typeof routeFn;

    interface Window {
        $: typeof $;
        jQuery: typeof $;
    }
}
declare module '@photo-sphere-viewer/markers-plugin' {
    import { AbstractPlugin } from '@photo-sphere-viewer/core';

    export class MarkersPlugin extends AbstractPlugin {
        clearMarkers(): void;
        addMarker(marker: { id: string;[key: string]: unknown }): void;
        on(event: 'select-marker', listener: (e: { marker: { id: string } }) => void): this;

    }

    export default MarkersPlugin;
}

