import React from 'react';
import { Info, ArrowRight } from 'lucide-react';

type Hotspot = {
    id: number;
    type: 'navigation' | 'info';
    yaw: number;
    pitch: number;
    tooltip: string | null;
    content: string | null;
    target_sphere: { id: number; name: string } | null;
    sphere: {
        id: number;
        name: string;
        sphere_file: string;
        sphere_image: string;
    } | null;
};

type Props = {
    hotspot: Hotspot;
};

export default function HotspotMarker({ hotspot }: Props) {
    const isInfo = hotspot.type === 'info';
    const borderColor = isInfo ? 'border-green-600' : 'border-blue-600';
    const IconComponent = isInfo ? Info : ArrowRight;
    return (
        <div className="relative w-0 h-0 overflow-visible transform -translate-x-1/2 -translate-y-full">
            <div
                className={`w-8 h-8 rounded-full border-2 ${borderColor} bg-white flex items-center justify-center shadow-md`}
            >
                <IconComponent className={`w-4 h-4 ${isInfo ? 'text-green-600' : 'text-blue-600'}`} />
            </div>

            <img
                src={hotspot.sphere?.sphere_image}
                alt={hotspot.sphere?.name ?? 'sphere image'}
                style={{
                    border: '2px solid red',
                    zIndex: 9999,
                    position: 'absolute',
                }}
                className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-20 w-32 h-20 object-cover rounded-md shadow-lg pointer-events-none"
            />

            {(hotspot.tooltip || hotspot.content) && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 bg-white bg-opacity-90 backdrop-blur-sm border border-gray-200 rounded-md p-2 shadow-lg max-w-xs text-center pointer-events-none">
                    {hotspot.tooltip && (
                        <div className="text-sm font-semibold text-gray-900 truncate" title={hotspot.tooltip}>
                            {hotspot.tooltip}
                        </div>
                    )}
                    {hotspot.content && (
                        <div className="text-xs text-gray-700 mt-1 whitespace-normal" title={hotspot.content}>
                            {hotspot.content}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
