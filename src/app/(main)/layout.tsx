
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import { getUser } from "@/services/auth";

export default function MainGroupLayout({
                                            children,
                                        }: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                await getUser();
                setChecking(false);
            } catch {
                router.replace("/login");
            }
        };

        checkAuth();
    }, [router]);

    if (checking) {
        return (
            <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f3f6fb] px-4">

                {/* Декоративный фон */}
                <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-blue-100/50 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-indigo-100/50 blur-3xl" />

                {/* Карточка загрузки */}
                <div className="relative w-full max-w-md rounded-2xl border border-slate-200/80 bg-white px-8 py-12 text-center shadow-[0_4px_20px_rgba(15,23,42,0.06)]">

                    {/* Иконка */}
                    <div className="relative mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#123254] shadow-lg shadow-blue-950/15">

                        <svg
                            className="h-9 w-9 text-white"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M12 3 20 6v5c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6l8-3Z" />
                            <rect x="9" y="10" width="6" height="5" rx="1" />
                            <path d="M10 10V8a2 2 0 0 1 4 0v2" />
                        </svg>

                        {/* Индикатор */}
                        <div className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-blue-500">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                        </div>
                    </div>

                    {/* Заголовок */}
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">
                        Проверка авторизации
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        Проверяем ваши учетные данные
                        <br />
                        и подготавливаем рабочее пространство
                    </p>

                    {/* Прогресс */}
                    <div className="mx-auto mt-8 flex max-w-[220px] items-center justify-center gap-3">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full w-1/3 animate-[loading_1.5s_ease-in-out_infinite] rounded-full bg-blue-600" />
                        </div>
                    </div>

                    {/* Подпись */}
                    <div className="mt-8 border-t border-slate-100 pt-6">
                        <div className="text-sm font-bold tracking-wide text-[#123254]">
                            АЗС CRM
                        </div>
                        <div className="mt-1 text-xs text-slate-400">
                            Система управления
                        </div>
                    </div>
                </div>

                <style jsx>{`
                    @keyframes loading {
                        0% {
                            transform: translateX(-120%);
                        }
                        100% {
                            transform: translateX(350%);
                        }
                    }
                `}</style>
            </div>
        );
    }

    return <MainLayout>{children}</MainLayout>;
}
