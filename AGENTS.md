# AGENTS.md — LyfeOS

Personal life organizer. Tauri v2 desktop app: React 19 (Vite) frontend + Rust backend + local SQLite.

## Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui
- **Backend:** Rust, Tauri v2
- **Package manager:** `bun` (lockfile: `bun.lock`)
- **Database:** SQLite via `tauri-plugin-sql`

## Commands

```bash
# Dev (starts Vite on :1420 + Tauri app)
bun tauri dev

# Build release
bun tauri build

# Add Tauri plugin (adds both JS + Rust deps and capability entries)
bun tauri add <plugin>
# e.g. bun tauri add sql
```

## Project Structure

```
src/                 # React frontend
  main.tsx           # Entry point
  App.tsx
src-tauri/
  src/
    main.rs          # Binary entry — just calls lyfeos_lib::run()
    lib.rs           # App setup: plugins, commands, state, run()
  capabilities/
    default.json     # Window permissions (Tauri v2 security model)
  tauri.conf.json    # Build hooks, window config, bundle, plugin config
  Cargo.toml
```

**Crate name:** The library crate is named `lyfeos_lib` (not `lyfeos`) to avoid a Windows Cargo naming conflict. `main.rs` imports `lyfeos_lib::run()`.

## Tauri v2 Patterns

### Commands
- Define in `src-tauri/src/lib.rs` with `#[tauri::command]`.
- Register in `.invoke_handler(tauri::generate_handler![cmd1, cmd2])`.
- Call from frontend: `import { invoke } from "@tauri-apps/api/core"; invoke("cmd", { arg })`.
- Return `Result<T, String>` to reject the frontend promise on `Err`.

### State
- Register: `.manage(Mutex::new(MyState { ... }))` in `lib.rs::run()`.
- Access in command: `state: tauri::State<'_, Mutex<MyState>>`.
- Lock with `.lock().unwrap()`; guard drops automatically.

### Capabilities / Security
- Every plugin API requires an explicit permission in `src-tauri/capabilities/default.json`.
- Adding a plugin via `bun tauri add <plugin>` usually updates capabilities automatically; verify.
- Never set `csp: null` in production. Currently disabled for dev only.

### Async & Setup
- Use `.setup(|app| { spawn(heavy_task(app.handle().clone())); Ok(()) })` for non-blocking init.
- Async commands: `async fn my_cmd(...) -> Result<...>`. Tauri handles Tokio runtime.

## SQLite (tauri-plugin-sql)

**Install:** `bun tauri add sql` (adds `@tauri-apps/plugin-sql`, `tauri-plugin-sql`, and capability entries).

**Migrations (Rust):**
```rust
use tauri_plugin_sql::{Builder, Migration, MigrationKind};

let migrations = vec![Migration {
    version: 1,
    description: "create_initial_tables",
    sql: "CREATE TABLE ...",
    kind: MigrationKind::Up,
}];

.plugin(
    tauri_plugin_sql::Builder::default()
        .add_migrations("sqlite:lyfeos.db", migrations)
        .build(),
)
```

**Preload in `tauri.conf.json`:**
```json
"plugins": {
  "sql": {
    "preload": ["sqlite:lyfeos.db"]
  }
}
```

**Frontend usage:**
```ts
import Database from "@tauri-apps/plugin-sql";
const db = await Database.load("sqlite:lyfeos.db");
await db.execute("INSERT INTO ...");
```

## Frontend Conventions

- **Tailwind v4:** Import `@import "tailwindcss";` in `src/index.css`. No `tailwind.config.js`.
- **shadcn/ui:** Initialize with `bunx shadcn@latest init` (Vite target). Add components with `bunx shadcn add <component>`.
- **Strict TS:** `tsconfig.json` has `noUnusedLocals` and `noUnusedParameters` enabled.
- **Vite quirks:**
  - Dev server port is fixed at `1420` (`strictPort: true`).
  - `clearScreen: false` so Rust errors stay visible.
  - `watch.ignored: ["**/src-tauri/**"]` — editing Rust does not trigger Vite reload.

## Important Constraints

- This is a **local-first personal app**. No server, no auth, no network APIs unless explicitly added.
- **Do not** install or run `npm`/`pnpm`/`yarn` commands. Use `bun` exclusively.
- **Do not** commit `src-tauri/target/` or `node_modules/`.
- If adding a new Tauri plugin, always verify the capability JSON was updated; manual edit is sometimes required.
