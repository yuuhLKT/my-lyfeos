import { useEffect, useState } from "react";
import { getVersion } from "@tauri-apps/api/app";

export function useAppVersion() {
    const [version, setVersion] = useState<string>("");

    useEffect(() => {
        getVersion().then(setVersion).catch(() => setVersion(""));
    }, []);

    return version;
}
