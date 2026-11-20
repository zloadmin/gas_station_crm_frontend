
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    Fuel,
    LayoutDashboard,
    ClipboardList,
    Package,
    LogOut,
} from "lucide-react";

import { getUser, logout, User } from "@/services/auth";

const menuItems = [
    {
        title: "Прибыль",
        href: "/",
        icon: LayoutDashboard,
    },
    {
        title: "Операции",
        href: "/operations",
        icon: ClipboardList,
    },
    {
        title: "Приходы топлива",
        href: "/fuel-arrivals",
        icon: Package,
    },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getUser()
            .then(setUser)
            .catch(() => {
                router.replace("/login");
            });
    }, [router]);

    const handleLogout = async () => {
        if (loading) return;

        setLoading(true);

        try {
            await logout();
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            router.replace("/login");
        }
    };

    const initials = user?.name
        ?.split(" ")
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase() || "?";

    return (
        <aside className="fixed inset-y-0 left-0 z-40 flex w-16 flex-col bg-[#102f50] text-white md:w-[220px]">
            {/* Logo */}
            <div className="flex h-[80px] shrink-0 flex-col items-center justify-center border-b border-white/10 md:h-[100px]">
                <Fuel size={30} strokeWidth={1.8} />
                <span className="mt-1 hidden text-sm font-bold tracking-wide md:block">
                    АЗС CRM
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-2 py-5 md:px-3">
                {menuItems.map((item) => {
                    const Icon = item.icon;

                    const active =
                        item.href === "/"
                            ? pathname === "/"
                            : pathname.startsWith(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={item.title}
                            className={`flex items-center justify-center gap-3 rounded-lg px-2 py-3 text-sm transition-colors md:justify-start md:px-3 md:py-2.5 ${
                                active
                                    ? "bg-[#24517e] font-semibold text-white"
                                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                            }`}
                        >
                            <Icon size={19} className="shrink-0" />
                            <span className="hidden md:inline">
                                {item.title}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            {/* User */}
            <div className="border-t border-white/10 p-2 md:p-4">
                <div className="flex items-center justify-center gap-3 md:justify-start">
                    <div
                        title={user?.name || "Загрузка..."}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-300 text-xs font-bold text-[#102f50]"
                    >
                        {initials}
                    </div>

                    <div className="hidden min-w-0 flex-1 md:block">
                        <div className="truncate text-xs font-semibold">
                            {user?.name || "Загрузка..."}
                        </div>
                        <div className="truncate text-[11px] text-slate-400">
                            {user?.email || ""}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleLogout}
                        disabled={loading}
                        title="Выйти"
                        className="flex shrink-0 items-center justify-center rounded-md p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
                    >
                        <LogOut size={17} />
                    </button>
                </div>
            </div>
        </aside>
    );
}
