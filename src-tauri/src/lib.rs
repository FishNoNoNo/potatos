mod cli;
mod db;
mod file;
mod tray;

use tauri::Manager;
use tauri_plugin_autostart::MacosLauncher;

#[tauri::command]
fn get_bootstrap_data() -> Result<db::BootstrapPayload, String> {
    db::get_bootstrap_data()
}

#[tauri::command]
fn create_todo(payload: db::TodoPayload) -> Result<db::TodoItem, String> {
    db::create_todo(payload)
}

#[tauri::command]
fn update_todo(id: String, payload: db::TodoPayload) -> Result<db::TodoItem, String> {
    db::update_todo(&id, payload)
}

#[tauri::command]
fn delete_todo(id: String) -> Result<(), String> {
    db::delete_todo(&id)
}

#[tauri::command]
fn set_todo_completed(id: String, completed: bool) -> Result<db::TodoItem, String> {
    db::set_todo_completed(&id, completed)
}

#[tauri::command]
fn mark_todo_reminded(id: String) -> Result<db::TodoItem, String> {
    db::mark_todo_reminded(&id)
}

#[tauri::command]
fn save_settings(payload: db::PotatosSettings) -> Result<db::PotatosSettings, String> {
    db::save_settings(payload)
}

pub fn run_cli_app(args: Vec<String>) -> Result<(), String> {
    cli::run_cli(args)
}
#[tauri::command]
fn is_first() -> Result<bool, String> {
    file::is_first()
}

#[tauri::command]
fn set_first() -> Result<(), String> {
    file::set_first()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let _ = db::open_database();

    tauri::Builder::default()
        .setup(|app| {
            // 创建系统托盘
            tray::setup_tray(app)?;
            Ok(())
        })
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            None::<Vec<&str>>,
        ))
        .plugin(tauri_plugin_single_instance::init(|app, args, cwd| {
            let _ = args;
            let _ = cwd;
            let _ = app
                .get_webview_window("main")
                .expect("no main window")
                .set_focus();
        }))
        .invoke_handler(tauri::generate_handler![
            get_bootstrap_data,
            create_todo,
            update_todo,
            delete_todo,
            set_todo_completed,
            mark_todo_reminded,
            save_settings,
            is_first,
            set_first
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
