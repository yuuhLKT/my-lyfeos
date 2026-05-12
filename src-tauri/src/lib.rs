// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

mod settings;

use tauri_plugin_sql::{Migration, MigrationKind};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![
        Migration {
            version: 1,
            description: "create_calendar_events_table",
            sql: "CREATE TABLE IF NOT EXISTS calendar_events (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, description TEXT, event_date TEXT NOT NULL, event_type TEXT NOT NULL CHECK(event_type IN ('event', 'reminder')), created_at TEXT DEFAULT CURRENT_TIMESTAMP);",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "migrate_to_custom_tags",
            sql: "
CREATE TABLE IF NOT EXISTS event_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    color TEXT DEFAULT '#3b82f6'
);

INSERT OR IGNORE INTO event_tags (name, color) VALUES ('Event', '#3b82f6');
INSERT OR IGNORE INTO event_tags (name, color) VALUES ('Reminder', '#f59e0b');

CREATE TABLE calendar_events_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    event_date TEXT NOT NULL,
    tag TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO calendar_events_new (id, title, description, event_date, tag, created_at)
SELECT
    id,
    title,
    description,
    event_date,
    CASE WHEN event_type = 'event' THEN 'Event' ELSE 'Reminder' END,
    created_at
FROM calendar_events;

DROP TABLE calendar_events;

ALTER TABLE calendar_events_new RENAME TO calendar_events;
            ",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 3,
            description: "create_tasks_table",
            sql: "
CREATE TABLE IF NOT EXISTS task_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    color TEXT DEFAULT '#3b82f6'
);

CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'todo',
    priority TEXT DEFAULT 'medium',
    tag TEXT,
    due_date TEXT,
    event_id INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES calendar_events(id)
);
            ",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 4,
            description: "add_task_start_date",
            sql: "
ALTER TABLE tasks ADD COLUMN start_date TEXT;
            ",
            kind: MigrationKind::Up,
        },
    ];

    tauri::Builder::default()
        .setup(|app| {
            #[cfg(desktop)]
            {
                let _ = app
                    .handle()
                    .plugin(tauri_plugin_updater::Builder::new().build());
                settings::init(app.handle()).expect("Falha ao inicializar as configurações");
            }
            Ok(())
        })
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:lyfeos.db", migrations)
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            settings::get_settings,
            settings::save_settings
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
