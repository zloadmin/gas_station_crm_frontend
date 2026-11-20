import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "АЗС — Панель управления",
    description: "Система управления АЗС",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ru">
        <body>{children}</body>
        </html>
    );
}