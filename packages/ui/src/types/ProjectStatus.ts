import type { Color } from "@ionic/core";

/**
 * プロジェクトステータスの型
 */
export type ProjectStatus = 'planning' | 'processing' | 'pause' | 'cancel' | 'complete' | string;

/**
 * プロジェクトステータスの日本語、色つき
 */
export const STATUS_OPTIONS: Array<{ value: ProjectStatus; label: string, color: Color }> =
    [
        { value: "planning", label: "計画中", color: 'primary' },
        { value: "processing", label: "進行中", color: 'success' },
        { value: "pause", label: "一時停止", color: 'medium' },
        { value: "cancel", label: "中止", color: 'warning' },
        { value: "complete", label: "完了", color: 'dark' }
    ];
