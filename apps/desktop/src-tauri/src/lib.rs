use anyhow::{Context, Result};
use std::fs;

use akizuki_invoice_parser::{models::invoice::Invoice, parser::html_parser};

use cap_locator_cli::{handle_set, load_env_defaults, FilterArgs, ProtocolArgs, SetArgs};
use hidapi::HidApi;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

fn is_vscode_debug() -> bool {
    std::env::var("VSCODE_DEBUG").is_ok()
}

// ローケーション
#[tauri::command]
fn highlight_location_led(serial_number: String, led_mask: u8) -> Result<u8, String> {
    if is_vscode_debug() {
        return Err("vscodeでデバックしている場合、HidApiの初期化でハングするため停止".into());
    }

    let env_defaults: cap_locator_cli::EnvDefaults = load_env_defaults()
        .context("envファイルの読み込みに失敗")
        .map_err(|e| e.to_string())?;

    let api: HidApi = HidApi::new()
        .context("failed to initialize HID API")
        .map_err(|e: anyhow::Error| e.to_string())?;

    let args: SetArgs = SetArgs {
        id: Some(serial_number),
        filter: (FilterArgs {
            vendor_id: (env_defaults.vendor_id),
            product_id: (env_defaults.product_id),
            usage_page: (env_defaults.usage_page),
            usage: (env_defaults.usage),
        }),
        protocol: (ProtocolArgs {
            report_len: (64),
            read_timeout_ms: (10),
        }),
        on_value: (led_mask),
        off_value: (0x00),
    };

    handle_set(&api, &args, &env_defaults, true)
        .context("デバイスへの通信に失敗")
        .map_err(|e| e.to_string())?;
    return Ok(0);
}

#[tauri::command]
fn highlight_off_location_led(serial_number: String) -> Result<u8, String> {
    if is_vscode_debug() {
        return Err("vscodeでデバックしている場合、HidApiの初期化でハングするため停止".into());
    }

    let env_defaults = load_env_defaults()
        .context("envファイルの読み込みに失敗")
        .map_err(|e| e.to_string())?;

    let api: HidApi = HidApi::new()
        .context("failed to initialize HID API")
        .map_err(|e| e.to_string())?;

    let args: SetArgs = SetArgs {
        id: Some(serial_number),
        filter: (FilterArgs {
            vendor_id: (env_defaults.vendor_id),
            product_id: (env_defaults.product_id),
            usage_page: (env_defaults.usage_page),
            usage: (env_defaults.usage),
        }),
        protocol: (ProtocolArgs {
            report_len: (64),
            read_timeout_ms: (10),
        }),
        on_value: (0x00),
        off_value: (0x00),
    };

    handle_set(&api, &args, &env_defaults, false)
        .context("デバイスとの通信に失敗")
        .map_err(|e| e.to_string())?;
    return Ok(0);
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
