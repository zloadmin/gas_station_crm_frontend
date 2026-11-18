import { api } from "@/lib/api";

export interface Service {
    id: number;
    name: string;
}

interface ServicesResponse {
    data: Service[];
}

export async function getServices(): Promise<Service[]> {
    const { data } = await api.get<ServicesResponse>("/services");
    return data.data;
}