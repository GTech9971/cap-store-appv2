use std::fs;

use akizuki_invoice_parser::{models::invoice::Invoice, parser::html_parser};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn parse_invoice(path: &str) -> String {
    let html_content: String = fs::read_to_string(path).unwrap();
    let invoice: Invoice = html_parser::parse_invoice(&html_content);

    return invoice.to_json_pretty().unwrap();
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, parse_invoice])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
