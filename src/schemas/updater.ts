import { z } from "zod";

const CheckingStateSchema = z.object({
  type: z.literal("checking"),
});

const NoUpdateStateSchema = z.object({
  type: z.literal("no-update"),
});

const DownloadingStateSchema = z.object({
  type: z.literal("downloading"),
  progress: z.number().min(0),
  contentLength: z.number().min(0),
});

const InstallingStateSchema = z.object({
  type: z.literal("installing"),
});

const RelaunchingStateSchema = z.object({
  type: z.literal("relaunching"),
});

const ErrorStateSchema = z.object({
  type: z.literal("error"),
  message: z.string(),
});

export const UpdaterStateSchema = z.union([
  CheckingStateSchema,
  NoUpdateStateSchema,
  DownloadingStateSchema,
  InstallingStateSchema,
  RelaunchingStateSchema,
  ErrorStateSchema,
]);

export type UpdaterState = z.infer<typeof UpdaterStateSchema>;
