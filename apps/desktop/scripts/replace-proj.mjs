import { readFile, writeFile } from 'node:fs/promises';

async function main() {
    const MODE_BUILD = "B";
    const MODE_INSTALL = "I";

    const mode = process.argv[2];

    console.log(`mode:${mode}`);

    try {
        const path = 'src-tauri/gen/apple/project.yml';
        const text = await readFile(path, 'utf-8');

        const targetText = '- script:';
        const exitText = 'exit 0';
        const scriptText = 'npm run -- tauri ios xcode-script -v --platform ${PLATFORM_DISPLAY_NAME:?} --sdk-root ${SDKROOT:?} --framework-search-paths "${FRAMEWORK_SEARCH_PATHS:?}" --header-search-paths "${HEADER_SEARCH_PATHS:?}" --gcc-preprocessor-definitions "${GCC_PREPROCESSOR_DEFINITIONS:-}" --configuration ${CONFIGURATION:?} ${FORCE_COLOR} ${ARCHS:?}';

        if (text.includes(targetText) === false) { throw new Error(`${targetText}が見つかりませんでした`); }

        const replaced = text.split('\n')
            .map(line => {
                if (line.includes(targetText)) {
                    const modeText = mode === MODE_BUILD
                        ? scriptText
                        : exitText;

                    console.log(`${line}`);
                    console.log(modeText);

                    return `      ${targetText} ${modeText}`;
                }
                else { return line; }
            }).join('\n');

        await writeFile(path, replaced, 'utf-8');

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

main();