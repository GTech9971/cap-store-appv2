#!/usr/bin/env node
/**
 * バージョン更新スクリプト
 * - 入力されたバージョンを以下に適用する:
 *   - package.json の version
 *   - package-lock.json の version（および packages[""] の version）
 *   - src-tauri/tauri.conf.json の version
 *   - src-tauri/tauri.conf.dev.windows.json の version（タイトルは変更しない）
 *   - src-tauri/Cargo.toml の [package] セクションの version
 *
 * 使い方:
 *   node scripts/set-version.mjs 0.3.2
 *   node scripts/set-version.mjs v0.3.2
 */

import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

/**
 * セマンティックバージョンを正規化および検証する
 * - 先頭の 'v' は許容して除去する
 * - SemVer の基本形式を軽く検証する
 * @param {string} input 入力バージョン文字列
 * @returns {string} 正規化済みバージョン
 */
function normalizeVersion(input) {
  if (!input || typeof input !== 'string') {
    throw new Error('バージョンが未入力です');
  }
  const v = input.trim().replace(/^v/i, '');
  // 緩めのSemVer検証: MAJOR.MINOR.PATCH[-pre][+build]
  const semverLike = /^(\d+)\.(\d+)\.(\d+)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
  if (!semverLike.test(v)) {
    throw new Error(`無効なバージョン形式です: ${input}`);
  }
  return v;
}

/**
 * JSONファイルを読み込み、変換関数で加工して保存する
 * @param {string} filePath ファイルパス
 * @param {(obj: any) => void} transform 変更関数（破壊的変更OK）
 */
async function updateJsonFile(filePath, transform) {
  const abs = resolve(process.cwd(), filePath);
  const raw = await readFile(abs, 'utf8');
  const obj = JSON.parse(raw);
  await transform(obj);
  const out = JSON.stringify(obj, null, 2) + '\n';
  await writeFile(abs, out, 'utf8');
}

/**
 * package-lock.json の version と packages[""] の version を更新する
 * @param {string} filePath ファイルパス
 * @param {string} version 新バージョン
 */
async function updatePackageLock(filePath, version) {
  const abs = resolve(process.cwd(), filePath);
  const raw = await readFile(abs, 'utf8');
  const obj = JSON.parse(raw);
  obj.version = version;
  if (obj.packages && Object.prototype.hasOwnProperty.call(obj.packages, '')) {
    if (!obj.packages['']) obj.packages[''] = {};
    obj.packages[''].version = version;
  }
  const out = JSON.stringify(obj, null, 2) + '\n';
  await writeFile(abs, out, 'utf8');
}

/**
 * Cargo.toml の [package] セクション内 version を安全に置換する
 * 次のセクション開始（例: [dependencies]）までの範囲に限定して置換する
 * @param {string} filePath ファイルパス
 * @param {string} version 新バージョン
 */
async function updateCargoToml(filePath, version) {
  const abs = resolve(process.cwd(), filePath);
  const text = await readFile(abs, 'utf8');

  // 行単位で処理して [package] セクション内の version を置換（コメントやCRLFにも強い）
  const lines = text.split(/\r?\n/);
  let inPackage = false;
  let changed = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*\[package\]\s*$/.test(line)) {
      inPackage = true;
      continue;
    }
    if (inPackage && /^\s*\[.+\]/.test(line)) {
      // 次のセクションに入ったら終了
      break;
    }
    if (inPackage) {
      // version = "x.y.z" の形式（シングル/ダブルクォート、末尾コメント対応）
      const m = line.match(/^(\s*version\s*=\s*)(["'])([^"']+)(\2)(\s*(#.*)?)\s*$/);
      if (m) {
        const prefix = m[1];
        const quote = '"'; // 常にダブルクォートで統一
        const tail = m[5] || '';
        lines[i] = `${prefix}${quote}${version}${quote}${tail}`.replace(/\s+$/, '');
        changed = true;
        break;
      }
    }
  }
  if (!changed) {
    throw new Error('Cargo.toml 内の version 行が見つかりませんでした');
  }
  await writeFile(abs, lines.join('\n'), 'utf8');
}

/**
 * メイン処理: 指定の全ファイルへバージョンを反映
 */
async function main() {
  try {
    const input = process.argv[2];
    const version = normalizeVersion(input);

    // package.json
    await updateJsonFile('package.json', (obj) => {
      obj.version = version;
    });

    // package-lock.json
    await updatePackageLock('package-lock.json', version);

    // src-tauri/tauri.conf.json（Tauri v2 形式）
    await updateJsonFile('src-tauri/tauri.conf.json', (obj) => {
      obj.version = version;
      // ウィンドウタイトル内のバージョンも更新する（存在する場合のみ置換）
      // 例: "cap-store-app[] 0.3.2" → "cap-store-app[] <version>"
      try {
        const windows = obj?.app?.windows;
        if (Array.isArray(windows)) {
          const semverInText = /(\d+)\.(\d+)\.(\d+)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?/;
          for (const w of windows) {
            if (w && typeof w.title === 'string' && semverInText.test(w.title)) {
              w.title = w.title.replace(semverInText, version);
            }
          }
        }
      } catch (_) {
        // タイトル更新は任意のため、失敗しても処理継続
      }
    });

    // src-tauri/Cargo.toml
    await updateCargoToml('src-tauri/Cargo.toml', version);

    // src-tauri/tauri.conf.dev.windows.json（Windows向け開発ビルド設定）
    // バージョンのみ更新し、ウィンドウタイトルは変更しない
    await updateJsonFile('src-tauri/tauri.conf.dev.windows.json', (obj) => { obj.version = version; });
    await updateJsonFile('src-tauri/tauri.conf.prod.json', (obj) => { obj.version = version; });
    await updateJsonFile('src-tauri/tauri.conf.prod.windows.json', (obj) => { obj.version = version; });
    await updateJsonFile('src-tauri/tauri.conf.stg-debug.json', (obj) => { obj.version = version; });
    await updateJsonFile('src-tauri/tauri.conf.stg.json', (obj) => { obj.version = version; });

    console.log(`バージョンを更新しました: ${version}`);
  } catch (err) {
    console.error(`[エラー] ${err?.message || err}`);
    process.exit(1);
  }
}

// エントリポイント実行
main();
