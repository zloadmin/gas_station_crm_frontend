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
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-sm text-slate-500">
                    Проверка авторизации...
                </div>
            </div>
        );
    }

    return <MainLayout>{children}</MainLayout>;
}