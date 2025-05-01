export interface Hotspot {
    id: number;
    sphere_id: number;
    type: 'navigation' | 'info';
    target_sphere_id: number | null;
    yaw: number;
    pitch: number;
    tooltip: string | null;
    content: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    trashed?: boolean;
}