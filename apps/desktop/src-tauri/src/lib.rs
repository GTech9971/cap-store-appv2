use std::fs;

use akizuki_invoice_parser::{models::invoice::Invoice, parser::html_parser};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn parse_invoice(path: &str) -> Result<Invoice, String> {
    let html_content_result: Result<String, std::io::Error> = fs::read_to_string(path);

    match html_content_result {
        Ok(html_content) => {
            return html_parser::parse_invoice(&html_content);
        }
        Err(error) => return Err(error.to_string()),
    };
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, parse_invoice])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
