import { useSettings, useSaveSettings } from "@/hooks/useSettings";
import { useTheme } from "@/providers/theme-provider";
import type { AppSettings, Theme } from "@/schemas/settings";
import { LoadingSpinner } from "@/components/commons/LoadingSpinner";
import { ErrorMessage } from "@/components/commons/ErrorMessage";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Monitor, Moon, Sun, Palette, Building2 } from "lucide-react";
import { useEffect } from "react";

const themeOptions: { value: Theme; label: string; icon: React.ElementType }[] =
    [
        { value: "light", label: "Light", icon: Sun },
        { value: "dark", label: "Dark", icon: Moon },
        { value: "system", label: "System", icon: Monitor },
    ];

export function SettingsScreen() {
    const { data: settings, isLoading, error } = useSettings();

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center">
                <LoadingSpinner title="Loading settings..." />
            </div>
        );
    }

    if (error || !settings) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center">
                <ErrorMessage title="Erro ao carregar configurações" />
            </div>
        );
    }

    return <SettingsView settings={settings} />;
}

function SettingsView({ settings }: { settings: AppSettings }) {
    const { theme, setTheme } = useTheme();
    const saveSettings = useSaveSettings();

    useEffect(() => {
        if (settings.theme !== theme) {
            setTheme(settings.theme);
        }
    }, [settings.theme]);

    const handleThemeChange = (value: string) => {
        const newTheme = value as Theme;
        setTheme(newTheme);
        saveSettings.mutate({
            ...settings,
            theme: newTheme,
        });
    };

    return (
        <div className="mx-auto w-full max-w-2xl space-y-6 py-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">
                    Manage your preferences and workspace settings.
                </p>
            </div>

            <Separator />

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Palette className="size-5 text-primary" />
                        <CardTitle>Appearance</CardTitle>
                    </div>
                    <CardDescription>
                        Customize how LyfeOS looks on your device.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="theme">Theme</Label>
                        <Select value={theme} onValueChange={handleThemeChange}>
                            <SelectTrigger
                                id="theme"
                                className="w-full sm:w-56"
                            >
                                <SelectValue placeholder="Select theme" />
                            </SelectTrigger>
                            <SelectContent>
                                {themeOptions.map((option) => {
                                    const Icon = option.icon;
                                    return (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            <span className="flex items-center gap-2">
                                                <Icon className="size-4" />
                                                {option.label}
                                            </span>
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            Select a theme that matches your preference. System
                            will follow your OS setting.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Building2 className="size-5 text-primary" />
                        <CardTitle>Workspace</CardTitle>
                    </div>
                    <CardDescription>
                        Your current workspace configuration.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="workspace">Default Workspace</Label>
                        <Select disabled value={settings.default_workspace}>
                            <SelectTrigger
                                id="workspace"
                                className="w-full sm:w-56"
                            >
                                <SelectValue placeholder="Select workspace" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Personal">
                                    Personal
                                </SelectItem>
                                <SelectItem value="Work">Work</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
