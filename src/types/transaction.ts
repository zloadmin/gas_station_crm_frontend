export interface TransactionFilters {
    date_from: string;
    date_to: string;
    service_id?: number;
    tid?: number;
    terminal_service_id?: number;
    type: string;
    id?: number;
    per_page: number;
    page: number;
}

export interface Transaction {
    id: number;
    tid: number;

    terminal_id: number | null;
    terminal_service_id: number | null;
    service_id: number | null;

    type: string;

    price: string | number;
    inserted: string | number;
    dispensed: string | number;
    price_returned: string | number;
    discount: string | number;
    currency: number;

    service_price: string | number | null;
    amount: string | number | null;
    amount_dispensed: string | number | null;

    // fisc: Record<string, any> | null;

    printed: boolean;
    sync: boolean;
    no_troubles: boolean;
    approved: boolean;

    user_id: number | null;
    remote_created_at: string | null;

    created_at?: string;
    updated_at?: string;

    terminal?: {
        id: number;
        name: string;
    } | null;

    terminal_service?: {
        id: number;
        name: string;
    } | null;

    service?: {
        id: number;
        name: string;
    } | null;

    organization?: {
        id: number;
        name: string;
    } | null;
    fuelArrival?: {
        id: number;
        date: string;
        price_per_liter: number;
    } | null;

    card_number?: string | null;
    discount_card?: string | null;
    fuel_card?: string | null;

    rrn?: string | null;
    order_id?: string | null;

    yandex_operation_id?: string | number | null;
}

export interface TransactionResponse {
    data: Transaction[];
    meta: {
        total: number;
        from: number | null;
        to: number | null;
        current_page: number;
        last_page: number;
    };
}