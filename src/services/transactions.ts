import { api } from "@/lib/api";

import {
    TransactionFilters,
    TransactionResponse,
} from "@/types/transaction";

export async function getTransactions(
    filters: TransactionFilters
): Promise<TransactionResponse> {
    const { data } = await api.get<TransactionResponse>(
        "/transactions",
        {
            params: filters,
        }
    );

    return data;
}