const INVALID_FILENAME_CHARS = /[\\/:*?"<>|]+/g;

type DownloadBlobOptions = {
    fileName?: string;
    fallbackFileName?: string;
    defaultFileName?: string;
    extension?: string;
};

const sanitizeFileName = (name?: string): string | undefined => {
    if (!name) return undefined;
    const trimmed = name.trim().replace(INVALID_FILENAME_CHARS, "_");
    return trimmed.length > 0 ? trimmed : undefined;
};

const ensureExtension = (name: string, extension?: string): string => {
    if (!extension) {
        return name;
    }
    const normalizedExtension = extension.startsWith(".") ? extension.toLowerCase() : `.${extension.toLowerCase()}`;
    return name.toLowerCase().endsWith(normalizedExtension) ? name : `${name}${normalizedExtension}`;
};

/**
 * Blobデータを任意のファイル名でダウンロードし、実際に使用したファイル名を返す。
 */
export const downloadBlob = (blob: Blob, options: DownloadBlobOptions = {}): string => {
    const { fileName, fallbackFileName, defaultFileName = "download", extension } = options;

    const sanitizedMain = sanitizeFileName(fileName);
    const sanitizedFallback = sanitizeFileName(fallbackFileName);
    const sanitizedDefault = sanitizeFileName(defaultFileName) ?? "download";

    const finalName = ensureExtension(sanitizedMain ?? sanitizedFallback ?? sanitizedDefault, extension);

    const url = URL.createObjectURL(blob);
    try {
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = finalName;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
    } finally {
        URL.revokeObjectURL(url);
    }

    return finalName;
};
