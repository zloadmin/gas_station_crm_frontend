"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Fuel,
    LayoutDashboard,
    ClipboardList,
    Package,
    BookOpen,
    LogOut,
} from "lucide-react";

const menuItems = [
    {
        title: "Главная",
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

    return (
        <aside className="fixed inset-y-0 left-0 z-40 flex w-[220px] flex-col bg-[#102f50] text-white">
            <div className="flex h-[100px] flex-col items-center justify-center border-b border-white/10">
                <Fuel size={34} strokeWidth={1.8} />
                <span className="mt-1 text-sm font-bold tracking-wide">
          АЗС CRM
        </span>
            </div>

            <nav className="flex-1 space-y-1 px-3 py-5">
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
                            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                                active
                                    ? "bg-[#24517e] font-semibold text-white"
                                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                            }`}
                        >
                            <Icon size={17} />
                            {item.title}
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t border-white/10 p-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-300 text-xs font-bold text-[#102f50]">
                        АИ
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold">Администратор</div>
                        <div className="text-[11px] text-slate-400">Выход</div>
                    </div>

                    <LogOut size={16} className="text-slate-400" />
                </div>
            </div>
        </aside>
    );
}
