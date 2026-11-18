export interface FuelService {
    id: number;
    name: string;
}

export interface FuelArrival {
    id: number;
    date: string;
    service_id: number;
    service: FuelService | null;
    quantity_kg: string;
    volume_liters: string;
    density: string;
    price_per_liter: string;
    total_price: string;
    created_at: string;
    updated_at: string;
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginationMeta {
    current_page: number;
    from: number | null;
    last_page: number;
    links: PaginationLink[];
    path: string;
    per_page: number;
    to: number | null;
    total: number;
}

export interface FuelArrivalResponse {
    data: FuelArrival[];
    links: {
        first: string | null;
        last: string | null;
        prev: string | null;
        next: string | null;
    };
    meta: PaginationMeta;
}

export interface FuelArrivalFilters {
    date_from?: string;
    date_to?: string;
    service_id?: number;
    per_page: number;
    page: number;
}
