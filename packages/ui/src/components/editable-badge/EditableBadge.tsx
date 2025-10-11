import { IonBadge } from "@ionic/react";
import React, { useCallback, useRef, useState } from "react";

export interface Prop {
    text: string,
    defaultText: string,
    onCommit: (text: string) => void
}

/**
 * 編集可能なIonBadge
 * @param param0 
 * @returns 
 */
export const EditableBadge: React.FC<Prop> = ({
    text,
    defaultText,
    onCommit
}) => {

    const ref = useRef<HTMLDivElement>(null);
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [edit, setEdit] = useState<string>(defaultText);

    const commitEdit = useCallback((): string => {
        setIsEdit(false);
        if (!ref.current) { throw new Error(); }

        // editRef の内容を取得して state に反映
        const newText = ref.current.textContent ?? '';
        setEdit(newText);
        return newText;
    }, []);

    const handleKeyDownTagBadge = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const text = commitEdit();
            onCommit(text);
        }
        if (e.key === 'Backspace') {
            if (!ref.current) { return; }
            const text = ref.current.textContent ?? '';
            if (text.length === 1) { e.preventDefault(); }
        }
        if (e.key === 'Escape') {
            setEdit(text);
            setIsEdit(false);
        }
    }, [commitEdit, text, onCommit]);

    return (
        isEdit ?
            <div
                style={{ display: 'flex', width: 'fit-content' }}
                ref={ref}
                contentEditable
                suppressContentEditableWarning
                onBlur={commitEdit}
                onKeyDown={handleKeyDownTagBadge}>
                <IonBadge>
                    {edit}
                </IonBadge>
            </div>
            :
            <IonBadge onClick={() => setIsEdit(true)}>
                {edit}
            </IonBadge>
    )
}