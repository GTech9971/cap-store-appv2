# iosへのインストール

## 初期処理

初回時
idであってメアドではない

```bash
export TAURI_APPLE_DEVELOPMENT_TEAM=""
```

```bash
npx tauri ios init -c ./src-tauri/tauri.conf.prod.json 
```

### OS固有クレートがある場合

hidapiがサポートされていないためビルド失敗
Cargo.tomlを修正

```toml
- hidapi = "2.6"
+ hidapi = { version = "2.6", optional = true }
```

以下の行追加

```toml
[features]
default = ["hid"]
hid = ["hidapi"]
```

### アイコン設定

```bash
npm run tauri icon public/32x32.png -- --ios-color #fff
```

## build

```bash
tauri ios build --debug --config ./src-tauri/tauri.conf.prod.json
```

xcodeを開きプロジェクトの`TARGETS>BuildPhase>Build Rust Code`のShellを以下に書き換える

```bash
exit 0
```

本来デバックでXCodeを使用するため以下のようなデバック用のコマンドがあるが、これがあるとios完結型としてインストールできないので消す

```bash
npm run -- tauri ios xcode-script -v --platform ${PLATFORM_DISPLAY_NAME:?} --sdk-root ${SDKROOT:?} --framework-search-paths "${FRAMEWORK_SEARCH_PATHS:?}" --header-search-paths "${HEADER_SEARCH_PATHS:?}" --gcc-preprocessor-definitions "${GCC_PREPROCESSOR_DEFINITIONS:-}" --configuration ${CONFIGURATION:?} ${FORCE_COLOR} ${ARCHS:?}
```

## install

xcodeデバイスを選んで実行
署名ができていないとエラーになるので設定をする

1. デバイス側の設定として`セキュリティとプライバシー`から開発者モードをON
2. `一般>VPNとデバイス管理`から`デベロッパアプリ`のメールアドレスを選択し`信頼`を選択する必要あり

修正したjsコードが反映されない場合は
XCode BuildPhasesの Build Rust Codeを元に戻して、`tauri ios build --debug --config ./src-tauri/tauri.conf.prod.json`をもう一回やる必要あり

物理的な場所としては``src-tauri/gen/apple/cap-stotr-app.xcodeproj/project.pbxproj`の236行めあたりのとこ

```
shellScript = "exit 0\n";
```

```
shellScript = "npm run -- tauri ios xcode-script -v --platform ${PLATFORM_DISPLAY_NAME:?} --sdk-root ${SDKROOT:?} --framework-search-paths \"${FRAMEWORK_SEARCH_PATHS:?}\" --header-search-paths \"${HEADER_SEARCH_PATHS:?}\" --gcc-preprocessor-definitions \"${GCC_PREPROCESSOR_DEFINITIONS:-}\" --configuration ${CONFIGURATION:?} ${FORCE_COLOR} ${ARCHS:?}\n";
```
