import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="sticky top-0 z-50 flex h-12 items-center gap-2 bg-background px-4">
                    <SidebarTrigger />
                </header>
                <div className="px-4 pb-4">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
