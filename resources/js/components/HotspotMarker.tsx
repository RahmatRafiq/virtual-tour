import React from 'react';
import { Info, ArrowRight } from 'lucide-react';
import { Hotspot } from '@/types/SphereView';



type Props = {
    hotspot: Hotspot;
};

export default function HotspotMarker({ hotspot }: Props) {
    const isInfo = hotspot.type === 'info';
    const borderColor = isInfo ? 'border-green-600' : 'border-blue-600';
    const IconComponent = isInfo ? Info : ArrowRight;
    return (
        <div className="relative w-0 h-0 overflow-visible transform -translate-x-1/2 -translate-y-full">
            <div className="absolute left-1/2 top-full transform -translate-x-1/2 ">
                <div className={`w-10 h-10 rounded-full border-2 ${borderColor} bg-white flex items-center justify-center shadow-md`}>
                    <IconComponent className={`w-5 h-5 ${isInfo ? 'text-green-600' : 'text-blue-600'}`} />
                </div>
            </div>


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
