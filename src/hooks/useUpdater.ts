import { useEffect, useState } from "react";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import type { UpdaterState } from "@/schemas/updater";

export function useUpdater() {
  const [state, setState] = useState<UpdaterState>({ type: "checking" });

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const update = await check();
        if (cancelled) return;

        if (!update) {
          setState({ type: "no-update" });
          return;
        }

        let contentLength = 0;
        let downloaded = 0;

        await update.downloadAndInstall((event) => {
          if (cancelled) return;
          switch (event.event) {
            case "Started":
              contentLength = event.data.contentLength ?? 0;
              break;
            case "Progress":
              downloaded += event.data.chunkLength;
              setState({
                type: "downloading",
                progress: downloaded,
                contentLength,
              });
              break;
            case "Finished":
              setState({ type: "installing" });
              break;
          }
        });

        if (cancelled) return;
        setState({ type: "relaunching" });
        await relaunch();
      } catch (err) {
        if (!cancelled) {
          setState({
            type: "error",
            message: err instanceof Error ? err.message : String(err),
          });
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
