
import Sidebar from "./Sidebar";

export default function MainLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#f3f6fb]">
            <Sidebar />

            <main className="ml-[220px] min-h-screen p-6">
                {children}
            </main>
        </div>
    );
}
