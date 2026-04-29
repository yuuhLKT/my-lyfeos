import { useEffect } from "react";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

export function useUpdater() {
  useEffect(() => {
    let cancelled = false;

    async function runUpdateCheck() {
      try {
        const update = await check();
        if (!update || cancelled) return;

        console.log(`[Updater] New version available: ${update.version}`);

        await update.downloadAndInstall((event) => {
          switch (event.event) {
            case "Started":
              console.log(
                `[Updater] Download started (${event.data.contentLength} bytes)`
              );
              break;
            case "Progress":
              console.log(`[Updater] Downloaded ${event.data.chunkLength} bytes`);
              break;
            case "Finished":
              console.log("[Updater] Download finished");
              break;
          }
        });

        console.log("[Updater] Update installed, relaunching app...");
        await relaunch();
      } catch (err) {
        console.error("[Updater] Error checking for updates:", err);
      }
    }

    runUpdateCheck();
    return () => {
      cancelled = true;
    };
  }, []);
}
