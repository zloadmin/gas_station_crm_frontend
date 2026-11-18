import type { Metadata } from "next";
import "./globals.css";
import MainLayout from "@/components/layout/MainLayout";

export const metadata: Metadata = {
  title: "АЗС CRM",
  description: "Система управления автозаправочной станцией",
};

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="ru">
      <body>
      <MainLayout>{children}</MainLayout>
      </body>
      </html>
  );
}
