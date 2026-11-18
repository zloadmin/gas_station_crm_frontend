import { api } from "@/lib/api";
import {
    FuelArrivalResponse,
    FuelArrivalFilters,
} from "@/types/fuel-arrival";

export async function getFuelArrivals(
    filters: FuelArrivalFilters
): Promise<FuelArrivalResponse> {
    const { data } = await api.get<FuelArrivalResponse>(
        "/fuel-arrivals",
        {
            params: filters,
        }
    );

    return data;
}
