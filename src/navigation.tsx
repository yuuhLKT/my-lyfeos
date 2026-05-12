import type { LucideIcon } from "lucide-react";
import { Home, Settings, User, LogOut, Landmark, Calendar, ListChecks } from "lucide-react";
import { HomeScreen } from "@/components/screens/HomeScreen";
import { SettingsScreen } from "@/components/screens/SettingsScreen";
import { ProfileScreen } from "@/components/screens/ProfileScreen";
import { FinanceScreen } from "@/components/screens/FinanceScreen";
import { CalendarScreen } from "@/components/screens/CalendarScreen";
import { TasksScreen } from "@/components/screens/TasksScreen";

export type NavAction = "navigate" | "logout";

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  component?: React.ComponentType;
  action?: NavAction;
}

export interface NavGroup {
  id: string;
  items: NavItem[];
}

// Main navigation items (rendered in SidebarContent)
export const mainNavigation: NavItem[] = [
  {
    id: "home",
    label: "Home",
    icon: Home,
    component: HomeScreen,
  },
  {
    id: "finance",
    label: "Finance",
    icon: Landmark,
    component: FinanceScreen,
  },
  {
    id: "calendar",
    label: "Calendar",
    icon: Calendar,
    component: CalendarScreen,
  },
  {
    id: "tasks",
    label: "Tasks",
    icon: ListChecks,
    component: TasksScreen,
  },
];

// Footer navigation items (rendered in SidebarFooter dropdown)
export const footerNavigation: NavItem[] = [
  {
    id: "profile",
    label: "Profile",
    icon: User,
    component: ProfileScreen,
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    component: SettingsScreen,
  },
  {
    id: "logout",
    label: "Log out",
    icon: LogOut,
    action: "logout",
  },
];

// All screens for App.tsx to render
export const allNavItems: NavItem[] = [...mainNavigation, ...footerNavigation];
