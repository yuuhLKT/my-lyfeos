import type { UpdaterState } from "@/schemas/updater";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LoadingSpinner } from "@/components/commons/LoadingSpinner";
import { ErrorMessage } from "@/components/commons/ErrorMessage";
import { useAppVersion } from "@/hooks/useAppVersion";
import { CloudDownload, CheckCircle2 } from "lucide-react";

interface UpdaterScreenProps {
    state: UpdaterState;
    onSkip: () => void;
}

function DownloadProgress({
    progress,
    contentLength,
}: {
    progress: number;
    contentLength: number;
}) {
    const percentage =
        contentLength > 0
            ? Math.min(100, Math.round((progress / contentLength) * 100))
            : 0;

    const formatSize = (bytes: number) =>
        bytes > 0 ? `${Math.round(bytes / 1024)} KB` : "0 KB";

    return (
        <div className="flex flex-col items-center gap-5 w-full">
            <div className="relative">
                <CloudDownload className="size-10 text-primary animate-bounce" />
            </div>

            <div className="w-full space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                        Baixando atualização...
                    </span>
                    <span className="font-medium tabular-nums">
                        {percentage}%
                    </span>
                </div>
                <Progress value={percentage} className="h-2 w-full" />
                <p className="text-right text-xs text-muted-foreground tabular-nums">
                    {contentLength > 0
                        ? `${formatSize(progress)} / ${formatSize(contentLength)}`
                        : formatSize(progress)}
                </p>
            </div>
        </div>
    );
}

export function UpdaterScreen({ state, onSkip }: UpdaterScreenProps) {
    const version = useAppVersion();

    const renderBody = () => {
        switch (state.type) {
            case "checking":
                return <LoadingSpinner title="Verificando atualizações..." />;

            case "downloading":
                return (
                    <DownloadProgress
                        progress={state.progress}
                        contentLength={state.contentLength}
                    />
                );

            case "installing":
                return <LoadingSpinner title="Instalando atualização..." />;

            case "relaunching":
                return <LoadingSpinner title="Reiniciando aplicativo..." />;

            case "no-update":
                return (
                    <div className="flex flex-col items-center gap-5 w-full">
                        <div className="rounded-full bg-green-500/10 p-3">
                            <CheckCircle2 className="size-10 text-green-500" />
                        </div>
                        <div className="space-y-1 text-center">
                            <h2 className="text-lg font-semibold">
                                Tudo atualizado
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Você está na versão mais recente do LyfeOS.
                            </p>
                        </div>
                        <Button
                            variant="default"
                            className="w-full"
                            onClick={onSkip}
                        >
                            Continuar
                        </Button>
                    </div>
                );

            case "error":
                return (
                    <div className="flex flex-col items-center gap-5 w-full">
                        <ErrorMessage title="Não foi possível verificar atualizações" />
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={onSkip}
                        >
                            Continuar mesmo assim
                        </Button>
                    </div>
                );
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background p-6">
            <Card className="w-full max-w-sm">
                <CardContent className="flex flex-col items-center gap-6 p-8">
                    <div className="flex flex-col items-center gap-3">
                        <h1 className="text-2xl font-bold tracking-tight">
                            LyfeOS
                        </h1>
                    </div>

                    {renderBody()}

                    {version && (
                        <p className="text-xs text-muted-foreground">
                            v{version}
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
