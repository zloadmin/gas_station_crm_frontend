
export interface ProfitFilters {
    date_from: string;
    date_to: string;
    service_id?: number;
}

export interface ProfitChanges {
    revenue: number;
    cost: number;
    profit: number;
}

export interface ProfitSummary {
    revenue: number;
    cost: number;
    profit: number;
    profitability: number;
    changes: ProfitChanges;
}

export interface ProfitChartItem {
    date: string;
    revenue: number;
    cost: number;
    profit: number;
}

export interface ProfitServiceItem {
    service_id: number;
    service_name: string;
    volume_liters: number;
    revenue: number;
    cost: number;
    profit: number;
}

export interface ProfitResponse {
    data: {
        summary: ProfitSummary;
        chart: ProfitChartItem[];
        by_services: ProfitServiceItem[];
    };
}
