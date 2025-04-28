import { Category } from "./category";

export interface VirtualTour {
    id: number;
    category_id: number;
    name: string;
    description?: string | null;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
    trashed?: boolean;
    category?: Category;
}