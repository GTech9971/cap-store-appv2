# iosへのインストール

## 初期処理

以下を実行してiosコード署名設定を行う.ここでやらなくてもXCodeから設定可能
idであってメアドではない

```bash
export APPLE_DEVELOPMENT_TEAM="XXXXX"
```

vscodeのタスク`ios-init`を実行

### OS固有クレートがある場合

hidapiがサポートされていないためビルド失敗
Cargo.tomlを修正

```toml
- hidapi = "2.6"
+ hidapi = { version = "2.6", optional = true }
```

- 以下の行追加
- defaultに"desktop"を設定するとiosビルド時にhidapiが含まれて失敗するので指定しないように

```toml
[features]
default = []
desktop = ["hid"]
mobile = []
hid = ["hidapi"]
```

### アイコン設定

```bash
npm run tauri icon src-tauri/icons/画像.png -- --ios-color #fff
```

## build

- vscodeのタスク`ios-build`実行

### 　内部処理

1. replace-script:build
xcodeを開きプロジェクトの`project.yml`のShellScriptをインストール時とBuild時で書き換える

2. xcodegen
 1でやった内容を反映する

署名ができていないとエラーになるので設定をする

## install

xcodeデバイスを選んで実行

1. tasksの`ios-install`実行
1. デバイス側の設定として`セキュリティとプライバシー`から開発者モードをON
1. `一般>VPNとデバイス管理`から`デベロッパアプリ`のメールアドレスを選択し`信頼`を選択する必要あり
