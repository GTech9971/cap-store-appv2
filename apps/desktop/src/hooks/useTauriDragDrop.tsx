import { useEffect } from "react";
import { getCurrentWebview } from "@tauri-apps/api/webview";

type DragDropHandler = (event: {
    type: "over" | "drop" | "cancelled";
    position?: { x: number; y: number };
    paths?: string[];
}) => void;

function isTauri(): boolean {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return typeof window !== "undefined" && !!(window as any).__TAURI__;
}

export function useTauriDragDrop(onEvent: DragDropHandler) {
    useEffect(() => {
        // if (isTauri() === false) {
        //     console.warn('not support');
        //     return;
        // }
        let webview;
        try {
            webview = getCurrentWebview();
            if (!webview) {
                console.warn("Tauri webview is not ready yet");
                return;
            }
        } catch (err) {
            console.warn(err);
            return;
        }

        let unlisten: (() => void) | undefined;


        webview
            .onDragDropEvent((event) => {
                if (event.payload.type === "over") {
                    onEvent({ type: "over", position: event.payload.position });
                } else if (event.payload.type === "drop") {
                    onEvent({ type: "drop", paths: event.payload.paths });
                } else {
                    onEvent({ type: "cancelled" });
                }
            })
            .then((fn) => {
                unlisten = fn;
            });

        return () => {
            if (unlisten) {
                unlisten();
            }
        };
    }, [onEvent]);
}