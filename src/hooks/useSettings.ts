import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { AppSettingsSchema, type AppSettings } from "@/schemas/settings";

const SETTINGS_KEY = ["settings"];

async function getSettings(): Promise<AppSettings> {
  const raw = await invoke<unknown>("get_settings");
  return AppSettingsSchema.parse(raw);
}

async function saveSettings(settings: AppSettings): Promise<void> {
  return invoke("save_settings", { newSettings: settings });
}

export function useSettings() {
  return useQuery({
    queryKey: SETTINGS_KEY,
    queryFn: getSettings,
  });
}

export function useSaveSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEY });
    },
  });
}
