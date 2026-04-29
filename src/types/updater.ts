export type UpdaterState =
  | { type: "checking" }
  | { type: "no-update" }
  | { type: "downloading"; progress: number; contentLength: number }
  | { type: "installing" }
  | { type: "relaunching" }
  | { type: "error"; message: string };
