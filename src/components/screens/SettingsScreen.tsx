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
import { Monitor, Moon, Sun, Palette, Building2, Globe } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";

export function SettingsScreen() {
    const { t } = useTranslation();
    const { data: settings, isLoading, error } = useSettings();

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center">
                <LoadingSpinner title={t("common.loading")} />
            </div>
        );
    }

    if (error || !settings) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center">
                <ErrorMessage title={t("common.error")} />
            </div>
        );
    }

    return <SettingsView settings={settings} />;
}

function SettingsView({ settings }: { settings: AppSettings }) {
    const { t } = useTranslation();
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

    const handleLanguageChange = (value: string) => {
        const newLanguage = value;
        i18n.changeLanguage(newLanguage);
        saveSettings.mutate({
            ...settings,
            language: newLanguage,
        });
    };

    const themeOptions: { value: Theme; label: string; icon: React.ElementType }[] =
        [
            { value: "light", label: t("settings.appearance.light"), icon: Sun },
            { value: "dark", label: t("settings.appearance.dark"), icon: Moon },
            { value: "system", label: t("settings.appearance.system"), icon: Monitor },
        ];

    const languageOptions = [
        { value: "en", label: t("settings.language.en") },
        { value: "pt-BR", label: t("settings.language.pt-BR") },
    ];

    return (
        <div className="mx-auto w-full max-w-7xl space-y-6 py-6 px-2">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">{t("settings.title")}</h1>
                <p className="text-muted-foreground">
                    {t("settings.description")}
                </p>
            </div>

            <Separator />

            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Palette className="size-5 text-primary" />
                            <CardTitle>{t("settings.appearance.title")}</CardTitle>
                        </div>
                        <CardDescription>
                            {t("settings.appearance.description")}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="theme">{t("settings.appearance.theme")}</Label>
                            <Select value={theme} onValueChange={handleThemeChange}>
                                <SelectTrigger
                                    id="theme"
                                    className="w-full sm:w-56"
                                >
                                    <SelectValue placeholder={t("settings.appearance.themePlaceholder")} />
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
                                {t("settings.appearance.themeHint")}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Globe className="size-5 text-primary" />
                            <CardTitle>{t("settings.language.title")}</CardTitle>
                        </div>
                        <CardDescription>
                            {t("settings.language.description")}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="language">{t("settings.language.label")}</Label>
                            <Select value={settings.language} onValueChange={handleLanguageChange}>
                                <SelectTrigger
                                    id="language"
                                    className="w-full sm:w-56"
                                >
                                    <SelectValue placeholder={t("settings.language.placeholder")} />
                                </SelectTrigger>
                                <SelectContent>
                                    {languageOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Building2 className="size-5 text-primary" />
                            <CardTitle>{t("settings.workspace.title")}</CardTitle>
                        </div>
                        <CardDescription>
                            {t("settings.workspace.description")}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="workspace">{t("settings.workspace.defaultWorkspace")}</Label>
                            <Select disabled value={settings.default_workspace}>
                                <SelectTrigger
                                    id="workspace"
                                    className="w-full sm:w-56"
                                >
                                    <SelectValue placeholder={t("settings.workspace.workspacePlaceholder")} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Personal">
                                        {t("settings.workspace.personal")}
                                    </SelectItem>
                                    <SelectItem value="Work">
                                        {t("settings.workspace.work")}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
