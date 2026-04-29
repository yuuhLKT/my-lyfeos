import type { UpdaterState } from "@/types/updater";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Sparkles,
  CloudDownload,
  CloudOff,
  RotateCw,
} from "lucide-react";

interface UpdaterScreenProps {
  state: UpdaterState;
  onSkip: () => void;
}

export function UpdaterScreen({ state, onSkip }: UpdaterScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-background">
      <Sparkles className="size-12 text-primary" />

      <h1 className="text-3xl font-bold tracking-tight">LyfeOS</h1>

      <div className="flex flex-col items-center gap-3">
        {state.type === "checking" && (
          <>
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Verificando atualizações...
            </p>
          </>
        )}

        {state.type === "downloading" && (
          <div className="flex flex-col items-center gap-3">
            <CloudDownload className="size-5 text-primary" />
            <p className="text-sm text-muted-foreground">
              Baixando atualização...
            </p>
            <div className="h-2 w-48 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{
                  width: `${
                    state.contentLength > 0
                      ? Math.min(
                          100,
                          Math.round(
                            (state.progress / state.contentLength) * 100
                          )
                        )
                      : 0
                  }%`,
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {state.contentLength > 0
                ? `${Math.round(state.progress / 1024)} KB / ${Math.round(state.contentLength / 1024)} KB`
                : `${Math.round(state.progress / 1024)} KB`}
            </p>
          </div>
        )}

        {state.type === "installing" && (
          <>
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Instalando...</p>
          </>
        )}

        {state.type === "relaunching" && (
          <>
            <RotateCw className="size-5 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Reiniciando...</p>
          </>
        )}

        {state.type === "no-update" && (
          <>
            <CloudOff className="size-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Tudo atualizado</p>
          </>
        )}

        {state.type === "error" && (
          <>
            <CloudOff className="size-5 text-destructive" />
            <p className="text-sm text-muted-foreground">
              Não foi possível verificar atualizações
            </p>
            <Button variant="link" size="sm" onClick={onSkip}>
              Continuar mesmo assim
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
