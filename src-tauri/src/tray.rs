// src-tauri/src/tray.rs
use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager,
};

pub fn setup_tray(app: &mut tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let app_handle = app.handle();

    // 创建菜单项
    let show_item = MenuItem::with_id(app_handle, "show", "显示窗口", true, None::<&str>)?;
    let hide_item = MenuItem::with_id(app_handle, "hide", "隐藏窗口", true, None::<&str>)?;
    let quit_item = MenuItem::with_id(app_handle, "quit", "退出", true, None::<&str>)?;

    // 创建分割线
    let separator = PredefinedMenuItem::separator(app_handle)?;

    // 创建菜单
    let menu = Menu::with_items(
        app_handle,
        &[&show_item, &hide_item, &separator, &quit_item],
    )?;

    // 创建系统托盘
    let _tray = TrayIconBuilder::new()
        .icon(app.default_window_icon().unwrap().clone())
        .menu(&menu)
        .show_menu_on_left_click(false) // 左键单击时不显示菜单
        .tooltip("Potatos")
        .on_menu_event(|app, event| match event.id.as_ref() {
            "show" => {
                println!("show menu item was clicked");
                let window = app.get_webview_window("main").unwrap();
                let _ = window.unminimize();
                let _ = window.show();
                let _ = window.set_focus();
            }
            "hide" => {
                println!("hide menu item was clicked");
                let window = app.get_webview_window("main").unwrap();
                let _ = window.hide();
            }
            "quit" => {
                println!("quit menu item was clicked");
                app.exit(0);
            }
            _ => {
                println!("menu item {:?} not handled", event.id);
            }
        })
        .on_tray_icon_event(|tray, event| match event {
            TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } => {
                println!("left click pressed and released");
                // in this example, let's show and focus the main window when the tray is clicked
                let app = tray.app_handle();
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.unminimize();
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
            _ => {
                // println!("unhandled event {event:?}");
            }
        })
        .build(app)?;

    Ok(())
}
