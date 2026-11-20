"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, Fuel, Loader2, Mail } from "lucide-react";
import { login } from "@/services/auth";
import axios from "axios";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        setLoading(true);
        setError("");

        try {
            await login({ email, password });

            router.replace("/");
            router.refresh();
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                if (err.response?.status === 422) {
                    setError("Неверный email или пароль");
                } else if (!err.response) {
                    setError("Не удалось подключиться к серверу");
                } else {
                    setError(
                        err.response.data?.message || "Не удалось выполнить вход"
                    );
                }
            } else {
                setError("Произошла непредвиденная ошибка");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#f3f6fb] px-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#102f50] text-white">
                        <Fuel size={28} />
                    </div>

                    <h1 className="text-2xl font-bold text-slate-900">
                        АЗС CRM
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Войдите в систему управления
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">

                    <div>
                        <label
                            htmlFor="email"
                            className="mb-1.5 block text-sm font-medium text-slate-700"
                        >
                            Email
                        </label>

                        <div className="relative">
                            <Mail
                                size={17}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="username"
                                autoFocus
                                placeholder="admin@example.com"
                                disabled={loading}
                                className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="mb-1.5 block text-sm font-medium text-slate-700"
                        >
                            Пароль
                        </label>

                        <div className="relative">
                            <LockKeyhole
                                size={17}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                                placeholder="Введите пароль"
                                disabled={loading}
                                className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                            />
                        </div>
                    </div>

                    {error && (
                        <div
                            role="alert"
                            className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600"
                        >
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !email || !password}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#102f50] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#19436d] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={17} className="animate-spin" />
                                Выполняется вход...
                            </>
                        ) : (
                            "Войти"
                        )}
                    </button>
                </form>

                <p className="mt-8 text-center text-xs text-slate-400">
                    АЗС CRM · Система управления
                </p>
            </div>
        </div>
    );
}
