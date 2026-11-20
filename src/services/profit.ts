import { api } from "@/lib/api";
import { ProfitFilters, ProfitResponse } from "@/types/profit";

export async function getProfit(
    filters: ProfitFilters
): Promise<ProfitResponse["data"]> {
    const { data } = await api.get<ProfitResponse>("/profit", {
        params: filters,
    });

    return data.data;
}

