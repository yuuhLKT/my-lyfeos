import { z } from "zod";

export const ThemeSchema = z.enum(["light", "dark", "system"]);
export type Theme = z.infer<typeof ThemeSchema>;

export const AppSettingsSchema = z.object({
    theme: ThemeSchema,
    default_workspace: z.string(),
    language: z.string(),
});

export type AppSettings = z.infer<typeof AppSettingsSchema>;
