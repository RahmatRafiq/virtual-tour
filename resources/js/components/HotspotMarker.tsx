type Hotspot = {
    id: number;
    type: 'navigation' | 'info';
    yaw: number;
    pitch: number;
    tooltip: string | null;
    content: string | null;
    target_sphere: { id: number; name: string } | null;
};

type Props = {
    hotspot: Hotspot;
};

export default function HotspotMarker({ hotspot }: Props) {
    const color = hotspot.type === 'navigation' ? '#2563EB' : '#059669';
    const label = hotspot.type === 'navigation' ? '' : 'ℹ️';

    return (
        <div
            style={{
                position: 'relative',
                width: 40,
                height: 40,
                transform: 'translate(-50%, -100%)',
            }}
        >
            <div
                style={{
                    width: 36,
                    height: 36,
                    border: `4px solid ${color}`,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                    boxShadow: '0 0 8px rgba(0,0,0,0.4)',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    top: 8,
                    left: 10,
                    color,
                    fontSize: 14,
                    fontWeight: 'bold',
                }}
            >
                {label}
            </div>
            {hotspot.tooltip && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        marginBottom: 6,
                        background: 'rgba(0,0,0,0.75)',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: 4,
                        fontSize: 12,
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none',
                    }}
                >
                    {hotspot.tooltip}
                </div>
            )}
        </div>
    );
}
