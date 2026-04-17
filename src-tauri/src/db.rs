use chrono::Utc;
use rusqlite::{params, Connection, OptionalExtension};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use uuid::Uuid;

const DEFAULT_THEME_KEY: &str = "graphite";
const DEFAULT_SOUND_KEY: &str = "pulse";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TodoItem {
    pub id: String,
    pub title: String,
    pub description: String,
    pub start_time: String,
    pub notify_before_minutes: i64,
    pub completed: bool,
    pub reminded_at: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TodoPayload {
    pub title: String,
    pub description: String,
    pub start_time: String,
    pub notify_before_minutes: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PotatosSettings {
    pub theme_key: String,
    pub autostart_enabled: bool,
    pub sound_key: String,
    pub default_notify_before_minutes: i64,
    pub window_x: i32,
    pub window_y: i32,
}

#[derive(Debug, Clone, Serialize)]
pub struct BootstrapPayload {
    pub todos: Vec<TodoItem>,
    pub settings: PotatosSettings,
}

pub fn database_path() -> Result<PathBuf, String> {
    let base_dir = dirs::data_local_dir().ok_or("unable to locate local data directory")?;
    let app_dir = base_dir.join("potatos");
    fs::create_dir_all(&app_dir).map_err(|error| error.to_string())?;
    Ok(app_dir.join("potatos.db"))
}

pub fn open_database() -> Result<Connection, String> {
    let path = database_path()?;
    let connection = Connection::open(path).map_err(|error| error.to_string())?;
    initialize_database(&connection)?;
    Ok(connection)
}

pub fn initialize_database(connection: &Connection) -> Result<(), String> {
    connection
        .execute_batch(
            "
            CREATE TABLE IF NOT EXISTS todos (
              id TEXT PRIMARY KEY,
              title TEXT NOT NULL,
              description TEXT NOT NULL DEFAULT '',
              start_time TEXT NOT NULL,
              notify_before_minutes INTEGER NOT NULL DEFAULT 0,
              completed INTEGER NOT NULL DEFAULT 0,
              reminded_at TEXT,
              created_at TEXT NOT NULL,
              updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS settings (
              key TEXT PRIMARY KEY,
              value TEXT NOT NULL
            );
            ",
        )
        .map_err(|error| error.to_string())?;

    seed_default_settings(connection)?;
    Ok(())
}

fn seed_default_settings(connection: &Connection) -> Result<(), String> {
    let defaults = [
        ("theme_key", DEFAULT_THEME_KEY),
        ("autostart_enabled", "false"),
        ("sound_key", DEFAULT_SOUND_KEY),
        ("default_notify_before_minutes", "0"),
        ("window_x", "0"),
        ("window_y", "0"),
    ];

    for (key, value) in defaults {
        connection
            .execute(
                "INSERT OR IGNORE INTO settings (key, value) VALUES (?1, ?2)",
                params![key, value],
            )
            .map_err(|error| error.to_string())?;
    }

    Ok(())
}

pub fn get_bootstrap_data() -> Result<BootstrapPayload, String> {
    Ok(BootstrapPayload {
        todos: list_todos()?,
        settings: load_settings()?,
    })
}

pub fn list_todos() -> Result<Vec<TodoItem>, String> {
    let connection = open_database()?;
    let mut statement = connection
        .prepare(
            "
            SELECT id, title, description, start_time, notify_before_minutes,
                   completed, reminded_at, created_at, updated_at
            FROM todos
            ORDER BY completed ASC, start_time ASC, created_at DESC
            ",
        )
        .map_err(|error| error.to_string())?;

    let rows = statement
        .query_map([], map_todo)
        .map_err(|error| error.to_string())?;

    rows.into_iter()
        .collect::<Result<Vec<_>, _>>()
        .map_err(|error| error.to_string())
}

pub fn create_todo(payload: TodoPayload) -> Result<TodoItem, String> {
    validate_payload(&payload)?;
    let connection = open_database()?;
    let todo = TodoItem {
        id: Uuid::new_v4().to_string(),
        title: payload.title.trim().to_string(),
        description: payload.description.trim().to_string(),
        start_time: payload.start_time,
        notify_before_minutes: payload.notify_before_minutes.max(0),
        completed: false,
        reminded_at: None,
        created_at: now_iso(),
        updated_at: now_iso(),
    };

    connection
        .execute(
            "
            INSERT INTO todos (
              id, title, description, start_time, notify_before_minutes,
              completed, reminded_at, created_at, updated_at
            )
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
            ",
            params![
                todo.id,
                todo.title,
                todo.description,
                todo.start_time,
                todo.notify_before_minutes,
                bool_to_int(todo.completed),
                todo.reminded_at,
                todo.created_at,
                todo.updated_at,
            ],
        )
        .map_err(|error| error.to_string())?;

    get_todo_by_id(&todo.id)
}

pub fn update_todo(id: &str, payload: TodoPayload) -> Result<TodoItem, String> {
    validate_payload(&payload)?;
    let connection = open_database()?;

    connection
        .execute(
            "
            UPDATE todos
            SET title = ?2,
                description = ?3,
                start_time = ?4,
                notify_before_minutes = ?5,
                reminded_at = NULL,
                updated_at = ?6
            WHERE id = ?1
            ",
            params![
                id,
                payload.title.trim(),
                payload.description.trim(),
                payload.start_time,
                payload.notify_before_minutes.max(0),
                now_iso(),
            ],
        )
        .map_err(|error| error.to_string())?;

    get_todo_by_id(id)
}

pub fn delete_todo(id: &str) -> Result<(), String> {
    let connection = open_database()?;
    connection
        .execute("DELETE FROM todos WHERE id = ?1", params![id])
        .map_err(|error| error.to_string())?;
    Ok(())
}

pub fn set_todo_completed(id: &str, completed: bool) -> Result<TodoItem, String> {
    let connection = open_database()?;
    connection
        .execute(
            "
            UPDATE todos
            SET completed = ?2,
                updated_at = ?3
            WHERE id = ?1
            ",
            params![id, bool_to_int(completed), now_iso()],
        )
        .map_err(|error| error.to_string())?;

    get_todo_by_id(id)
}

pub fn mark_todo_reminded(id: &str) -> Result<TodoItem, String> {
    let connection = open_database()?;
    connection
        .execute(
            "
            UPDATE todos
            SET reminded_at = ?2,
                updated_at = ?3
            WHERE id = ?1
            ",
            params![id, now_iso(), now_iso()],
        )
        .map_err(|error| error.to_string())?;

    get_todo_by_id(id)
}

pub fn load_settings() -> Result<PotatosSettings, String> {
    let connection = open_database()?;
    let mut statement = connection
        .prepare("SELECT key, value FROM settings")
        .map_err(|error| error.to_string())?;
    let rows = statement
        .query_map([], |row| {
            Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
        })
        .map_err(|error| error.to_string())?;

    let pairs = rows
        .into_iter()
        .collect::<Result<Vec<_>, _>>()
        .map_err(|error| error.to_string())?;

    let mut settings = PotatosSettings {
        theme_key: DEFAULT_THEME_KEY.to_string(),
        autostart_enabled: false,
        sound_key: DEFAULT_SOUND_KEY.to_string(),
        default_notify_before_minutes: 0,
        window_x: 0,
        window_y: 0,
    };

    for (key, value) in pairs {
        match key.as_str() {
            "theme_key" => settings.theme_key = value,
            "autostart_enabled" => settings.autostart_enabled = value == "true",
            "sound_key" => settings.sound_key = value,
            "default_notify_before_minutes" => {
                settings.default_notify_before_minutes = value.parse::<i64>().unwrap_or(0)
            }
            "window_x" => settings.window_x = value.parse::<i32>().unwrap_or(0),
            "window_y" => settings.window_y = value.parse::<i32>().unwrap_or(0),
            _ => {}
        }
    }

    Ok(settings)
}

pub fn save_settings(payload: PotatosSettings) -> Result<PotatosSettings, String> {
    let connection = open_database()?;
    let pairs = [
        ("theme_key", payload.theme_key.clone()),
        (
            "autostart_enabled",
            if payload.autostart_enabled {
                "true".to_string()
            } else {
                "false".to_string()
            },
        ),
        ("sound_key", payload.sound_key.clone()),
        (
            "default_notify_before_minutes",
            payload.default_notify_before_minutes.max(0).to_string(),
        ),
        ("window_x", payload.window_x.to_string()),
        ("window_y", payload.window_y.to_string()),
    ];

    for (key, value) in pairs {
        connection
            .execute(
                "
                INSERT INTO settings (key, value)
                VALUES (?1, ?2)
                ON CONFLICT(key) DO UPDATE SET value = excluded.value
                ",
                params![key, value],
            )
            .map_err(|error| error.to_string())?;
    }

    load_settings()
}

pub fn get_todo_by_id(id: &str) -> Result<TodoItem, String> {
    let connection = open_database()?;
    connection
        .query_row(
            "
            SELECT id, title, description, start_time, notify_before_minutes,
                   completed, reminded_at, created_at, updated_at
            FROM todos
            WHERE id = ?1
            ",
            params![id],
            map_todo,
        )
        .optional()
        .map_err(|error| error.to_string())?
        .ok_or_else(|| format!("todo not found: {id}"))
}

fn map_todo(row: &rusqlite::Row) -> rusqlite::Result<TodoItem> {
    Ok(TodoItem {
        id: row.get(0)?,
        title: row.get(1)?,
        description: row.get(2)?,
        start_time: row.get(3)?,
        notify_before_minutes: row.get(4)?,
        completed: row.get::<_, i64>(5)? == 1,
        reminded_at: row.get(6)?,
        created_at: row.get(7)?,
        updated_at: row.get(8)?,
    })
}

fn validate_payload(payload: &TodoPayload) -> Result<(), String> {
    if payload.title.trim().is_empty() {
        return Err("title is required".to_string());
    }

    if payload.start_time.trim().is_empty() {
        return Err("start_time is required".to_string());
    }

    Ok(())
}

fn bool_to_int(value: bool) -> i64 {
    if value {
        1
    } else {
        0
    }
}

fn now_iso() -> String {
    Utc::now().to_rfc3339()
}
