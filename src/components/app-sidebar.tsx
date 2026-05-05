import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Briefcase,
    ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { mainNavigation, footerNavigation } from "@/navigation";
import { useAppStore } from "@/stores/appStore";
import type { NavItem } from "@/navigation";

export function AppSidebar() {
    const [workspace, setWorkspace] = useState("Personal");
    const activeScreen = useAppStore((state) => state.activeScreen);
    const setActiveScreen = useAppStore((state) => state.setActiveScreen);

    const handleNavClick = (item: NavItem) => {
        if (item.action === "logout") {
            // TODO: implement logout
            console.log("Logout clicked");
            return;
        }
        if (item.component) {
            setActiveScreen(item.id);
        }
    };

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                >
                                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                        <Briefcase className="size-4" />
                                    </div>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">
                                            {workspace}
                                        </span>
                                        <span className="truncate text-xs text-muted-foreground">
                                            Workspace
                                        </span>
                                    </div>
                                    <ChevronDown className="ml-auto size-4" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="start">
                                <DropdownMenuLabel>
                                    Workspaces
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => setWorkspace("Personal")}
                                >
                                    <Briefcase className="mr-2 size-4" />
                                    <span>Personal</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setWorkspace("Work")}
                                >
                                    <Briefcase className="mr-2 size-4" />
                                    <span>Work</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarMenu>
                        {mainNavigation.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeScreen === item.id;

                            return (
                                <SidebarMenuItem key={item.id}>
                                    <SidebarMenuButton
                                        isActive={isActive}
                                        onClick={() => handleNavClick(item)}
                                    >
                                        <Icon className="size-4" />
                                        <span>{item.label}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            );
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                >
                                    <Avatar className="size-8 rounded-lg">
                                        <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                                            JD
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">
                                            John Doe
                                        </span>
                                        <span className="truncate text-xs text-muted-foreground">
                                            john@example.com
                                        </span>
                                    </div>
                                    <ChevronDown className="ml-auto size-4" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-56"
                                align="start"
                                side="top"
                            >
                                <DropdownMenuLabel>
                                    My Account
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {footerNavigation.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = activeScreen === item.id;

                                    return (
                                        <DropdownMenuItem
                                            key={item.id}
                                            onClick={() => handleNavClick(item)}
                                            className={isActive ? "bg-accent" : ""}
                                        >
                                            <Icon className="mr-2 size-4" />
                                            <span>{item.label}</span>
                                        </DropdownMenuItem>
                                    );
                                })}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
