import { api } from "@/lib/api";

export interface TransactionType {
    value: string;
    label: string;
}

interface TransactionTypesResponse {
    data: TransactionType[];
}

export async function getTransactionTypes(): Promise<TransactionType[]> {
    const { data } = await api.get<TransactionTypesResponse>("/transactions/payment-types");
    return data.data;
}