import { api } from "@/lib/api";

export interface User {
    id: number;
    name: string;
    email: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface LoginResponse {
    user: User;
    token: string;
}

export const login = async (
    credentials: LoginCredentials
): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>("/login", credentials);

    localStorage.setItem("token", data.token);

    return data;
};

export const getUser = async (): Promise<User> => {
    const { data } = await api.get<User>("/user");
    return data;
};

export const logout = async (): Promise<void> => {
    try {
        await api.post("/logout");
    } finally {
        localStorage.removeItem("token");
    }
};