
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




// import { ProfitFilters, ProfitResponse } from "@/types/profit";
//
// const mockProfit: ProfitResponse["data"] = {
//     summary: {
//         revenue: 706050,
//         cost: 558000,
//         profit: 148050,
//         profitability: 20.97,
//         changes: {
//             revenue: 11,
//             cost: 9,
//             profit: 13,
//         },
//     },
//
//     chart: [
//         {
//             date: "2026-11-13",
//             revenue: 110000,
//             cost: 87000,
//             profit: 23000,
//         },
//         {
//             date: "2026-11-14",
//             revenue: 118000,
//             cost: 93000,
//             profit: 25000,
//         },
//         {
//             date: "2026-11-15",
//             revenue: 115000,
//             cost: 91000,
//             profit: 24000,
//         },
//         {
//             date: "2026-11-16",
//             revenue: 140000,
//             cost: 110000,
//             profit: 30000,
//         },
//         {
//             date: "2026-11-17",
//             revenue: 120000,
//             cost: 95000,
//             profit: 25000,
//         },
//         {
//             date: "2026-11-18",
//             revenue: 125000,
//             cost: 100000,
//             profit: 25000,
//         },
//         {
//             date: "2026-11-19",
//             revenue: 130050,
//             cost: 82000,
//             profit: 48050,
//         },
//     ],
//
//     by_services: [
//         {
//             service_id: 1,
//             service_name: "АИ-92",
//             volume_liters: 1000,
//             revenue: 65000,
//             cost: 55000,
//             profit: 10000,
//         },
//         {
//             service_id: 2,
//             service_name: "АИ-95",
//             volume_liters: 1500,
//             revenue: 106050,
//             cost: 87000,
//             profit: 19050,
//         },
//         {
//             service_id: 3,
//             service_name: "ДТ",
//             volume_liters: 500,
//             revenue: 32500,
//             cost: 27500,
//             profit: 5000,
//         },
//     ],
// };
//
// export async function getProfit(
//     filters: ProfitFilters
// ): Promise<ProfitResponse["data"]> {
//     await new Promise((resolve) => setTimeout(resolve, 400));
//
//     let result = structuredClone(mockProfit);
//
//     // Фильтр по марке топлива
//     if (filters.service_id) {
//         result.by_services = result.by_services.filter(
//             (item) => item.service_id === filters.service_id
//         );
//
//         const selected = result.by_services[0];
//
//         result.summary.revenue = selected?.revenue ?? 0;
//         result.summary.cost = selected?.cost ?? 0;
//         result.summary.profit = selected?.profit ?? 0;
//
//         result.summary.profitability =
//             result.summary.revenue > 0
//                 ? (result.summary.profit / result.summary.revenue) * 100
//                 : 0;
//
//         result.summary.changes = {
//             revenue: 0,
//             cost: 0,
//             profit: 0,
//         };
//     }
//
//     // Фильтр по периоду
//     result.chart = result.chart.filter((item) => {
//         return (
//             item.date >= filters.date_from &&
//             item.date <= filters.date_to
//         );
//     });
//
//     return result;
// }
