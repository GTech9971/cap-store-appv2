use std::fs;

use akizuki_invoice_parser::{models::invoice::Invoice, parser::html_parser};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

// ローケーション
#[tauri::command]
fn highlight_location_led(location_id: &str, position_index: u8) -> Result<u8, String> {
    // TODO
    // TODO location_idとusb serial numberとの紐づけとそれの解決
    // TODO position_indexとled_maskの変換

    // TODO 上記結果をもとにcap-locator-cliの実行、結果の返却
    return Ok(0x00001);
}

#[tauri::command]
fn highlight_off_location_led() -> Result<u8, String> {
    // TODO 上記結果をもとにcap-locator-cliの実行、結果の返却
    return Ok(0x00001);
}

// 帳票
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
        .invoke_handler(tauri::generate_handler![
            highlight_location_led,
            highlight_off_location_led,
            parse_invoice
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
