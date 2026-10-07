import { Sidebar } from "@/components/Sidebar";
import { NotificationBell } from "@/components/NotificationBell";

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex">
            <Sidebar />
            <main className="flex-1 min-h-screen p-6 max-w-full overflow-x-hidden relative">
                <div className="absolute top-6 right-6 z-40">
                    <NotificationBell />
                </div>
                {children}
            </main>
        </div>
    );
}
