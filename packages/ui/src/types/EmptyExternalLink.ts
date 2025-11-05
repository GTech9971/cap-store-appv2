import type { ProjectExternalLink } from "cap-store-api-def";

/**
 * 最初に表示される未入力の外部リンク
 */
export const EmptyExternalLink: ProjectExternalLink = {
    link: 'http://localhost:1420',
    tag: "タグ無し",
    title: 'タイトルなし'
}