import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Landmark, Link, TrendingUp, Wallet, CreditCard, PiggyBank } from "lucide-react";
import { useTranslation } from "react-i18next";

export function FinanceScreen() {
    const { t } = useTranslation();

    return (
        <div className="mx-auto w-full max-w-7xl space-y-6 py-6 px-2">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">{t("finance.title")}</h1>
                <p className="text-muted-foreground">{t("finance.description")}</p>
            </div>

            <Separator />

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Landmark className="size-5 text-primary" />
                        <CardTitle>{t("finance.belvoIntegration.title")}</CardTitle>
                    </div>
                    <CardDescription>
                        {t("finance.belvoIntegration.description")}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-4">
                        <Link className="size-5 text-muted-foreground" />
                        <div>
                            <p className="text-sm font-medium">{t("finance.belvoIntegration.statusLabel")}</p>
                            <p className="text-xs text-muted-foreground">{t("finance.belvoIntegration.statusValue")}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <Wallet className="size-5 text-primary" />
                        <CardTitle className="text-base">{t("finance.features.accounts")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">{t("finance.features.accountsDesc")}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CreditCard className="size-5 text-primary" />
                        <CardTitle className="text-base">{t("finance.features.transactions")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">{t("finance.features.transactionsDesc")}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <TrendingUp className="size-5 text-primary" />
                        <CardTitle className="text-base">{t("finance.features.analytics")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">{t("finance.features.analyticsDesc")}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <PiggyBank className="size-5 text-primary" />
                        <CardTitle className="text-base">{t("finance.features.budgets")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">{t("finance.features.budgetsDesc")}</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
